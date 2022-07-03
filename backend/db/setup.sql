/* This file contains the SQL statements required to create the tables used
   by the application. This is just included for reference, as SQLAlchemy will
   take care of doing this for us if the tables do not exist.
   */
CREATE TABLE form_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name VARCHAR(320) NULL,
  email VARCHAR(320) NULL,
  message STRING NOT NULL,
  created_at TIMESTAMP NOT NULL,
  CONSTRAINT "primary" PRIMARY KEY (id ASC),
  FAMILY "primary" (id, name, email, message, created_at)
);

CREATE TABLE work_experience (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  company VARCHAR(255) NULL,
  "position" VARCHAR(255) NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  description VARCHAR NULL,
  CONSTRAINT "primary" PRIMARY KEY (id ASC),
  FAMILY "primary" (id, company, "position", start_date, end_date, description)
);

CREATE TABLE personal_projects (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(255) NULL,
    description VARCHAR NULL,
    skills STRING[],
    url STRING NULL,
    CONSTRAINT "primary" PRIMARY KEY (id ASC),
    FAMILY "primary" (id, name, description)
);
