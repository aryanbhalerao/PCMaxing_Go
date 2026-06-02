package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
)

type partDetails struct {
	Details map[string]interface{} `json:"details"`
}

type compatibilityRequest struct {
	Parts map[string]partDetails `json:"parts"`
}

type compatibilityResponse struct {
	Issues []string `json:"issues"`
}

// CompatibilityRouter returns a chi router for /api/compatibility.
func CompatibilityRouter() http.Handler {
	r := chi.NewRouter()
	r.Post("/", checkCompatibility)
	return r
}

// POST /api/compatibility
func checkCompatibility(w http.ResponseWriter, r *http.Request) {
	var req compatibilityRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Parts == nil {
		writeError(w, http.StatusBadRequest, `"parts" object is required`)
		return
	}

	issues := make([]string, 0)
	parts := req.Parts

	cpu := parts["CPU"]
	gpu := parts["GPU"]
	psu := parts["PSU"]
	caseComp := parts["Case"]
	mb := parts["Motherboard"]

	// CPU ↔ Motherboard socket
	if mb.Details != nil && cpu.Details != nil {
		mbSocket := detailStr(mb, "Socket")
		cpuSocket := detailStr(cpu, "Socket")
		if mbSocket != "" && cpuSocket != "" && mbSocket != cpuSocket {
			issues = append(issues, fmt.Sprintf(
				"Motherboard not compatible with CPU: socket %s ≠ %s", mbSocket, cpuSocket,
			))
		}
	}

	// GPU card length ↔ Case max GPU length
	if gpu.Details != nil && caseComp.Details != nil {
		gpuLen := detailInt(gpu, "Card Length")
		caseMax := detailInt(caseComp, "Max GPU Length")
		if gpuLen > 0 && caseMax > 0 && gpuLen > caseMax {
			issues = append(issues, fmt.Sprintf(
				"GPU not compatible with Case: card length %dmm exceeds case max %dmm", gpuLen, caseMax,
			))
		}
	}

	// Motherboard form factor ↔ Case motherboard support
	if mb.Details != nil && caseComp.Details != nil {
		mbFF := detailStr(mb, "Form Factor")
		caseMbSupport := detailStr(caseComp, "Motherboard Support")
		if mbFF != "" && caseMbSupport != "" {
			supported := strings.Split(caseMbSupport, "/")
			for i, s := range supported {
				supported[i] = strings.TrimSpace(s)
			}
			if !containsStr(supported, mbFF) {
				issues = append(issues, fmt.Sprintf(
					"Motherboard not compatible with Case: %s not supported (supports %s)", mbFF, caseMbSupport,
				))
			}
		}
	}

	// PSU wattage ↔ CPU + GPU TDP
	if psu.Details != nil && (cpu.Details != nil || gpu.Details != nil) {
		psuW := detailInt(psu, "Wattage")
		var cpuTdp, gpuTdp int
		if cpu.Details != nil {
			cpuTdp = detailInt(cpu, "TDP")
		}
		if gpu.Details != nil {
			gpuTdp = detailInt(gpu, "TDP")
		}
		totalW := cpuTdp + gpuTdp
		if psuW > 0 && totalW > 0 && psuW < totalW {
			issues = append(issues, fmt.Sprintf(
				"PSU not compatible with System: %dW < CPU (%dW) + GPU (%dW) = %dW",
				psuW, cpuTdp, gpuTdp, totalW,
			))
		}
	}

	writeJSON(w, http.StatusOK, compatibilityResponse{Issues: issues})
}

// detailStr returns a string representation of a component detail field.
func detailStr(p partDetails, key string) string {
	if p.Details == nil {
		return ""
	}
	v, ok := p.Details[key]
	if !ok {
		return ""
	}
	return fmt.Sprintf("%v", v)
}

// detailInt parses the leading integer from a detail field value (handles "65W", "300mm", plain 65).
func detailInt(p partDetails, key string) int {
	s := detailStr(p, key)
	var buf strings.Builder
	for _, c := range s {
		if c >= '0' && c <= '9' {
			buf.WriteRune(c)
		} else if buf.Len() > 0 {
			break
		}
	}
	n, _ := strconv.Atoi(buf.String())
	return n
}

func containsStr(slice []string, s string) bool {
	for _, v := range slice {
		if v == s {
			return true
		}
	}
	return false
}
