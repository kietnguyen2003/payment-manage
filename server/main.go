package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

var store *Storage

func main() {
	// Initialize storage
	store = NewStorage("database.json")

	r := gin.Default()

	// Setup CORS
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"https://kit-payment.vercel.app"}
	config.AllowMethods = []string{"GET", "POST", "DELETE", "OPTIONS"}
	r.Use(cors.New(config))

	// Routes
	api := r.Group("/api")
	{
		api.GET("/transactions", getTransactions)
		api.POST("/transactions", createTransaction)
		api.DELETE("/transactions/:id", deleteTransaction)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server running on port %s", port)
	r.Run(":" + port)
}

func getTransactions(c *gin.Context) {
	transactions, err := store.Load()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load transactions"})
		return
	}
	c.JSON(http.StatusOK, transactions)
}

func createTransaction(c *gin.Context) {
	var input struct {
		Amount      float64 `json:"amount" binding:"required"`
		Description string  `json:"description" binding:"required"`
		Category    string  `json:"category" binding:"required"`
		Date        string  `json:"date" binding:"required"`
		Type        string  `json:"type" binding:"required,oneof=income expense"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	transactions, err := store.Load()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load transactions"})
		return
	}

	newTransaction := Transaction{
		ID:          uuid.New().String(),
		Amount:      input.Amount,
		Description: input.Description,
		Category:    input.Category,
		Date:        input.Date,
		Type:        input.Type,
	}

	transactions = append([]Transaction{newTransaction}, transactions...) // Prepend

	if err := store.Save(transactions); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save transaction"})
		return
	}

	c.JSON(http.StatusCreated, newTransaction)
}

func deleteTransaction(c *gin.Context) {
	id := c.Param("id")

	transactions, err := store.Load()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load transactions"})
		return
	}

	var filtered []Transaction
	found := false
	for _, t := range transactions {
		if t.ID != id {
			filtered = append(filtered, t)
		} else {
			found = true
		}
	}

	if !found {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
		return
	}

	if err := store.Save(filtered); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save transactions"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Transaction deleted"})
}
