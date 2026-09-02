-- leads.project is free text: employees type an actual project name or
-- description into it (see leadSchema in routes/leads.js, and the CRM's own
-- "No project description provided." fallback copy in EmployeeLogin.jsx). It
-- is not a category.
--
-- The website enquiry form's new "Project type" field is the opposite: a
-- closed list a visitor picks from (Residential / Renovation / Modular
-- Kitchen / Commercial / Office / Not sure yet). Writing that into
-- leads.project would mix two incompatible kinds of data in one free-text
-- column — a visitor's category selection sitting in the same field an
-- employee uses for a real project description, indistinguishable from one
-- another once stored.
--
-- A dedicated, constrained column keeps both honest: leads.project stays
-- exactly what it always was, and leads.project_type is queryable,
-- filterable, and cannot silently drift to a value nothing on the site or in
-- the CRM ever offers.
ALTER TABLE leads ADD COLUMN project_type VARCHAR(30) NULL
    CONSTRAINT ck_leads_project_type CHECK (
        project_type IN ('Residential', 'Renovation', 'Modular Kitchen', 'Commercial / Office', 'Not sure yet')
    );
