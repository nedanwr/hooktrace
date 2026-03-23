// Package diff provides structured comparison of two captured webhook requests,
// highlighting differences in method, path, headers, body, and response.
package diff

import (
	"encoding/json"
	"fmt"
	"sort"
	"strings"

	"github.com/nedanwr/hooktrace/apps/cli/internal/store"
)

// DiffResult holds the complete structured diff between two captured requests.
type DiffResult struct {
	Left    RequestSummary   `json:"left"`
	Right   RequestSummary   `json:"right"`
	Changes []Change         `json:"changes"`
	Summary DiffSummary      `json:"summary"`
}

// RequestSummary provides identifying info for a request in a diff.
type RequestSummary struct {
	ID        string `json:"id"`
	Method    string `json:"method"`
	Path      string `json:"path"`
	Timestamp string `json:"timestamp"`
}

// Change represents a single difference between two requests.
type Change struct {
	Section  string `json:"section"`  // "method", "path", "query", "header", "body", "status", "response_header", "response_body"
	Type     string `json:"type"`     // "modified", "added", "removed"
	Key      string `json:"key"`      // Header name or field identifier
	Left     string `json:"left"`     // Value in left request
	Right    string `json:"right"`    // Value in right request
}

// DiffSummary provides counts of changes by type.
type DiffSummary struct {
	TotalChanges int `json:"totalChanges"`
	Added        int `json:"added"`
	Removed      int `json:"removed"`
	Modified     int `json:"modified"`
}

// Diff compares two captured requests and returns a structured diff result.
func Diff(left, right *store.CapturedRequest) *DiffResult {
	result := &DiffResult{
		Left: RequestSummary{
			ID:        left.ID,
			Method:    left.Method,
			Path:      left.Path,
			Timestamp: left.Timestamp.Format("2006-01-02T15:04:05Z07:00"),
		},
		Right: RequestSummary{
			ID:        right.ID,
			Method:    right.Method,
			Path:      right.Path,
			Timestamp: right.Timestamp.Format("2006-01-02T15:04:05Z07:00"),
		},
		Changes: make([]Change, 0),
	}

	// Compare method.
	if left.Method != right.Method {
		result.addChange("method", "modified", "Method", left.Method, right.Method)
	}

	// Compare path.
	if left.Path != right.Path {
		result.addChange("path", "modified", "Path", left.Path, right.Path)
	}

	// Compare query.
	if left.Query != right.Query {
		result.addChange("query", "modified", "Query", left.Query, right.Query)
	}

	// Compare request headers.
	diffHeaders(result, "header", left.Headers, right.Headers)

	// Compare request body.
	diffBody(result, "body", left.Body, right.Body)

	// Compare response.
	if left.Response != nil && right.Response != nil {
		if left.Response.StatusCode != right.Response.StatusCode {
			result.addChange("status", "modified", "Status Code",
				fmt.Sprintf("%d", left.Response.StatusCode),
				fmt.Sprintf("%d", right.Response.StatusCode))
		}
		diffHeaders(result, "response_header", left.Response.Headers, right.Response.Headers)
		diffBody(result, "response_body", left.Response.Body, right.Response.Body)
	} else if left.Response == nil && right.Response != nil {
		result.addChange("status", "added", "Response", "", fmt.Sprintf("%d", right.Response.StatusCode))
	} else if left.Response != nil && right.Response == nil {
		result.addChange("status", "removed", "Response", fmt.Sprintf("%d", left.Response.StatusCode), "")
	}

	// Compute summary.
	for _, c := range result.Changes {
		switch c.Type {
		case "added":
			result.Summary.Added++
		case "removed":
			result.Summary.Removed++
		case "modified":
			result.Summary.Modified++
		}
	}
	result.Summary.TotalChanges = len(result.Changes)

	return result
}

func (r *DiffResult) addChange(section, changeType, key, left, right string) {
	r.Changes = append(r.Changes, Change{
		Section: section,
		Type:    changeType,
		Key:     key,
		Left:    left,
		Right:   right,
	})
}

// diffHeaders compares two sets of HTTP headers and records changes.
func diffHeaders(result *DiffResult, section string, left, right map[string][]string) {
	allKeys := make(map[string]bool)
	for k := range left {
		allKeys[k] = true
	}
	for k := range right {
		allKeys[k] = true
	}

	sortedKeys := make([]string, 0, len(allKeys))
	for k := range allKeys {
		sortedKeys = append(sortedKeys, k)
	}
	sort.Strings(sortedKeys)

	for _, key := range sortedKeys {
		leftVals, leftOK := left[key]
		rightVals, rightOK := right[key]

		leftStr := strings.Join(leftVals, ", ")
		rightStr := strings.Join(rightVals, ", ")

		if leftOK && !rightOK {
			result.addChange(section, "removed", key, leftStr, "")
		} else if !leftOK && rightOK {
			result.addChange(section, "added", key, "", rightStr)
		} else if leftStr != rightStr {
			result.addChange(section, "modified", key, leftStr, rightStr)
		}
	}
}

// diffBody compares two request/response bodies and records differences.
func diffBody(result *DiffResult, section string, left, right []byte) {
	leftStr := string(left)
	rightStr := string(right)

	if leftStr == rightStr {
		return
	}

	// Try to produce pretty-printed JSON for better diffing.
	leftStr = tryPrettyJSON(leftStr)
	rightStr = tryPrettyJSON(rightStr)

	if leftStr == "" && rightStr != "" {
		result.addChange(section, "added", "Body", "", rightStr)
	} else if leftStr != "" && rightStr == "" {
		result.addChange(section, "removed", "Body", leftStr, "")
	} else {
		result.addChange(section, "modified", "Body", leftStr, rightStr)
	}
}

// tryPrettyJSON attempts to pretty-print a string as JSON; returns the original if it fails.
func tryPrettyJSON(s string) string {
	if s == "" {
		return s
	}
	var v interface{}
	if err := json.Unmarshal([]byte(s), &v); err != nil {
		return s
	}
	pretty, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return s
	}
	return string(pretty)
}
