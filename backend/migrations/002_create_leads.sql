CREATE TABLE leads (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    phone NVARCHAR(30) NOT NULL,
    email NVARCHAR(255) NULL,
    city NVARCHAR(100) NULL,
    address NVARCHAR(255) NULL,
    project NVARCHAR(150) NULL,
    message NVARCHAR(MAX) NULL,
    source NVARCHAR(50) NOT NULL,
    value DECIMAL(14, 2) NULL,
    stage NVARCHAR(30) NOT NULL DEFAULT 'New'
        CONSTRAINT CK_leads_stage CHECK (stage IN ('New', 'Qualified', 'Consultation', 'Proposal', 'Execution', 'Won', 'Lost')),
    owner_id INT NULL REFERENCES employees(id),
    next_action_date DATE NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
