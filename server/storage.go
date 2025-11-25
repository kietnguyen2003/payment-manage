package main

import (
	"encoding/json"
	"os"
	"sync"
)

type Storage struct {
	filename string
	mu       sync.Mutex
}

func NewStorage(filename string) *Storage {
	return &Storage{filename: filename}
}

func (s *Storage) Load() ([]Transaction, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	file, err := os.ReadFile(s.filename)
	if err != nil {
		if os.IsNotExist(err) {
			return []Transaction{}, nil
		}
		return nil, err
	}

	var transactions []Transaction
	if len(file) == 0 {
		return []Transaction{}, nil
	}

	err = json.Unmarshal(file, &transactions)
	return transactions, err
}

func (s *Storage) Save(transactions []Transaction) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	data, err := json.MarshalIndent(transactions, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(s.filename, data, 0644)
}
