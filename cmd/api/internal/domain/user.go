package domain

import (
	"context"
	"time"
)

type User struct {
	ID        string    `json:"id"`
	TenantID  string    `json:"tenantId"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	Role      string    `json:"role"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"createdAt"`
}

type UserRepository interface {
	Create(ctx context.Context, user *User) error
	GetByID(ctx context.Context, id string) (*User, error)
	GetByEmail(ctx context.Context, tenantID, email string) (*User, error)
	ListByTenant(ctx context.Context, tenantID string) ([]*User, error)
	Update(ctx context.Context, user *User) error
}