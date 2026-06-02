const { Router } = require('express');

const router = Router();

// POST /api/compatibility
// Body: { parts: { CPU: { details: {...} }, GPU: { details: {...} }, ... } }
router.post('/', (req, res) => {
  const { parts } = req.body;
  if (!parts || typeof parts !== 'object') {
    return res.status(400).json({ error: '"parts" object is required' });
  }

  const issues = [];
  const { CPU: cpu, GPU: gpu, PSU: psu, Case: caseComp, Motherboard: mb } = parts;

  if (mb && cpu) {
    const mbSocket = String(mb.details?.['Socket'] ?? '');
    const cpuSocket = String(cpu.details?.['Socket'] ?? '');
    if (mbSocket && cpuSocket && mbSocket !== cpuSocket) {
      issues.push(`Motherboard not compatible with CPU: socket ${mbSocket} ≠ ${cpuSocket}`);
    }
  }

  if (gpu && caseComp) {
    const gpuLen = parseInt(String(gpu.details?.['Card Length'] ?? '0'));
    const caseMax = parseInt(String(caseComp.details?.['Max GPU Length'] ?? '0'));
    if (gpuLen > 0 && caseMax > 0 && gpuLen > caseMax) {
      issues.push(`GPU not compatible with Case: card length ${gpuLen}mm exceeds case max ${caseMax}mm`);
    }
  }

  if (mb && caseComp) {
    const mbFF = String(mb.details?.['Form Factor'] ?? '');
    const caseMbSupport = String(caseComp.details?.['Motherboard Support'] ?? '');
    const supported = caseMbSupport.split('/').map((s) => s.trim());
    if (mbFF && supported.length > 0 && !supported.includes(mbFF)) {
      issues.push(`Motherboard not compatible with Case: ${mbFF} not supported (supports ${caseMbSupport})`);
    }
  }

  if (psu && (cpu || gpu)) {
    const psuW = parseInt(String(psu.details?.['Wattage'] ?? '0'));
    const cpuTdp = cpu ? parseInt(String(cpu.details?.['TDP'] ?? '0')) : 0;
    const gpuTdp = gpu ? parseInt(String(gpu.details?.['TDP'] ?? '0')) : 0;
    const totalW = cpuTdp + gpuTdp;
    if (psuW > 0 && totalW > 0 && psuW < totalW) {
      issues.push(`PSU not compatible with System: ${psuW}W < CPU (${cpuTdp}W) + GPU (${gpuTdp}W) = ${totalW}W`);
    }
  }

  res.json({ issues });
});

module.exports = router;
