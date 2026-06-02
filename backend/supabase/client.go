package supabase

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
)

var (
	restURL string
	apiKey  string
	hc      = &http.Client{}
)

// Init reads SUPABASE_URL and SUPABASE_ANON_KEY from the environment.
func Init() {
	restURL = strings.TrimRight(os.Getenv("SUPABASE_URL"), "/") + "/rest/v1"
	apiKey = os.Getenv("SUPABASE_ANON_KEY")
}

// Query is a chainable PostgREST query builder.
type Query struct {
	table   string
	selCols string
	filters []string
	order   []string
}

// From starts a query against the given table.
func From(table string) *Query {
	return &Query{table: table}
}

// Select sets the columns to return (default: "*").
func (q *Query) Select(cols string) *Query {
	q.selCols = cols
	return q
}

// Eq adds an equality filter: column=eq.value
func (q *Query) Eq(col, val string) *Query {
	q.filters = append(q.filters, col+"=eq."+url.QueryEscape(val))
	return q
}

// ILike adds a case-insensitive pattern filter: column=ilike.*pattern*
func (q *Query) ILike(col, pattern string) *Query {
	q.filters = append(q.filters, col+"=ilike."+url.QueryEscape(pattern))
	return q
}

// Order appends an ordering clause. Multiple calls accumulate left to right.
func (q *Query) Order(col string, ascending bool) *Query {
	dir := "asc"
	if !ascending {
		dir = "desc"
	}
	q.order = append(q.order, col+"."+dir)
	return q
}

func (q *Query) queryString() string {
	cols := "*"
	if q.selCols != "" {
		cols = q.selCols
	}

	parts := append([]string{"select=" + cols}, q.filters...)
	if len(q.order) > 0 {
		// Commas separate columns in a single order param — no URL-encoding needed here.
		parts = append(parts, "order="+strings.Join(q.order, ","))
	}
	return strings.Join(parts, "&")
}

// Execute runs the query and JSON-decodes the response into dest (must be a pointer).
func (q *Query) Execute(dest interface{}) error {
	endpoint := fmt.Sprintf("%s/%s?%s", restURL, q.table, q.queryString())

	req, err := http.NewRequest(http.MethodGet, endpoint, nil)
	if err != nil {
		return err
	}
	req.Header.Set("apikey", apiKey)
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Accept", "application/json")

	resp, err := hc.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("supabase error %d: %s", resp.StatusCode, string(body))
	}

	return json.Unmarshal(body, dest)
}
