ALTER TABLE employees
    ADD COLUMN is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN permissions JSONB NOT NULL DEFAULT '{}',
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'Active'
        CONSTRAINT ck_employees_status CHECK (status IN ('Active', 'Disabled'));
