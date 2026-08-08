ALTER TABLE customers ADD phone NVARCHAR(30) NULL, email NVARCHAR(255) NULL, address NVARCHAR(255) NULL, city NVARCHAR(100) NULL, company_name NVARCHAR(150) NULL, gstin NVARCHAR(20) NULL, status NVARCHAR(30) NOT NULL DEFAULT 'Active';

CREATE TABLE projects (
    id INT IDENTITY(1,1) PRIMARY KEY,
    project_code NVARCHAR(40) NOT NULL UNIQUE,
    customer_id INT NOT NULL REFERENCES customers(id),
    name NVARCHAR(150) NOT NULL,
    project_type NVARCHAR(80) NOT NULL,
    site_address NVARCHAR(255) NOT NULL,
    city NVARCHAR(100) NULL,
    area_sqft DECIMAL(12,2) NULL,
    budget DECIMAL(14,2) NULL,
    stage NVARCHAR(40) NOT NULL DEFAULT 'Enquiry',
    start_date DATE NULL,
    target_date DATE NULL,
    scope NVARCHAR(MAX) NULL,
    created_by INT NOT NULL REFERENCES employees(id),
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

ALTER TABLE quotations ADD project_id INT NULL REFERENCES projects(id);
