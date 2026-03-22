package store

import "sync"

const DefaultCapacity = 50

// MemoryStore is a thread-safe, fixed-capacity ring buffer of captured requests.
// When the buffer is full, the oldest request is evicted.
type MemoryStore struct {
	mu       sync.RWMutex
	items    []*CapturedRequest
	capacity int
	index    map[string]int // id → position in items slice
}

// NewMemoryStore creates a new in-memory store with the given capacity.
func NewMemoryStore(capacity int) *MemoryStore {
	if capacity <= 0 {
		capacity = DefaultCapacity
	}
	return &MemoryStore{
		items:    make([]*CapturedRequest, 0, capacity),
		capacity: capacity,
		index:    make(map[string]int, capacity),
	}
}

func (s *MemoryStore) Add(req *CapturedRequest) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if len(s.items) >= s.capacity {
		// Evict the oldest (index 0).
		evicted := s.items[0]
		delete(s.index, evicted.ID)
		s.items = s.items[1:]
		// Rebuild index after shift.
		for i, r := range s.items {
			s.index[r.ID] = i
		}
	}
	s.index[req.ID] = len(s.items)
	s.items = append(s.items, req)
}

func (s *MemoryStore) Get(id string) *CapturedRequest {
	s.mu.RLock()
	defer s.mu.RUnlock()

	idx, ok := s.index[id]
	if !ok {
		return nil
	}
	return s.items[idx]
}

func (s *MemoryStore) List(limit int) []*CapturedRequest {
	s.mu.RLock()
	defer s.mu.RUnlock()

	n := len(s.items)
	if limit <= 0 || limit > n {
		limit = n
	}
	// Return newest first.
	result := make([]*CapturedRequest, limit)
	for i := range limit {
		result[i] = s.items[n-1-i]
	}
	return result
}

func (s *MemoryStore) Clear() {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.items = s.items[:0]
	s.index = make(map[string]int, s.capacity)
}

func (s *MemoryStore) Count() int {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return len(s.items)
}
