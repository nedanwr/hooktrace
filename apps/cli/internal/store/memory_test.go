package store

import (
	"fmt"
	"testing"
	"time"
)

func TestMemoryStore_AddAndGet(t *testing.T) {
	s := NewMemoryStore(5)

	req := &CapturedRequest{
		ID:        "abc123",
		Method:    "POST",
		Path:      "/webhook",
		Timestamp: time.Now(),
	}
	s.Add(req)

	got := s.Get("abc123")
	if got == nil {
		t.Fatal("expected to find request, got nil")
	}
	if got.Method != "POST" {
		t.Errorf("expected POST, got %s", got.Method)
	}
}

func TestMemoryStore_ListNewestFirst(t *testing.T) {
	s := NewMemoryStore(10)
	for i := range 5 {
		s.Add(&CapturedRequest{
			ID:        fmt.Sprintf("req-%d", i),
			Timestamp: time.Now(),
		})
	}

	list := s.List(3)
	if len(list) != 3 {
		t.Fatalf("expected 3 items, got %d", len(list))
	}
	if list[0].ID != "req-4" {
		t.Errorf("expected newest first (req-4), got %s", list[0].ID)
	}
	if list[2].ID != "req-2" {
		t.Errorf("expected req-2 at index 2, got %s", list[2].ID)
	}
}

func TestMemoryStore_Eviction(t *testing.T) {
	s := NewMemoryStore(3)
	for i := range 5 {
		s.Add(&CapturedRequest{
			ID:        fmt.Sprintf("req-%d", i),
			Timestamp: time.Now(),
		})
	}

	if s.Count() != 3 {
		t.Errorf("expected count 3, got %d", s.Count())
	}

	// Oldest two (req-0, req-1) should be evicted.
	if s.Get("req-0") != nil {
		t.Error("req-0 should have been evicted")
	}
	if s.Get("req-1") != nil {
		t.Error("req-1 should have been evicted")
	}
	if s.Get("req-2") == nil {
		t.Error("req-2 should still exist")
	}
	if s.Get("req-4") == nil {
		t.Error("req-4 should still exist")
	}
}

func TestMemoryStore_Clear(t *testing.T) {
	s := NewMemoryStore(10)
	s.Add(&CapturedRequest{ID: "a", Timestamp: time.Now()})
	s.Add(&CapturedRequest{ID: "b", Timestamp: time.Now()})
	s.Clear()

	if s.Count() != 0 {
		t.Errorf("expected 0 after clear, got %d", s.Count())
	}
	if s.Get("a") != nil {
		t.Error("expected nil after clear")
	}
}

func TestMemoryStore_ListAll(t *testing.T) {
	s := NewMemoryStore(10)
	s.Add(&CapturedRequest{ID: "a", Timestamp: time.Now()})
	s.Add(&CapturedRequest{ID: "b", Timestamp: time.Now()})

	// limit=0 should return all.
	list := s.List(0)
	if len(list) != 2 {
		t.Fatalf("expected 2, got %d", len(list))
	}
}
