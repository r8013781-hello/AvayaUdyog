CREATE TABLE project_payments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id),
    amount DECIMAL(14,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_mode NVARCHAR(50) NOT NULL,
    reference_no NVARCHAR(100) NULL,
    notes NVARCHAR(500) NULL,
    created_by INT NOT NULL REFERENCES employees(id),
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
