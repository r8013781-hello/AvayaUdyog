CREATE TABLE quotations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    quotation_no NVARCHAR(40) NOT NULL UNIQUE,
    customer_id INT NULL REFERENCES customers(id),
    customer_name NVARCHAR(100) NOT NULL,
    project_name NVARCHAR(150) NOT NULL,
    project_address NVARCHAR(255) NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'Draft'
        CONSTRAINT CK_quotations_status CHECK (status IN ('Draft', 'Sent', 'Approved', 'Rejected', 'Expired')),
    valid_until DATE NULL,
    subtotal DECIMAL(14,2) NOT NULL DEFAULT 0,
    discount DECIMAL(14,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 18,
    tax_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
    grand_total DECIMAL(14,2) NOT NULL DEFAULT 0,
    notes NVARCHAR(MAX) NULL,
    created_by INT NOT NULL REFERENCES employees(id),
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE quotation_items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    quotation_id INT NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    item_name NVARCHAR(150) NOT NULL,
    description NVARCHAR(500) NULL,
    quantity DECIMAL(12,2) NOT NULL,
    unit NVARCHAR(30) NOT NULL,
    unit_price DECIMAL(14,2) NOT NULL,
    line_total DECIMAL(14,2) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
);
