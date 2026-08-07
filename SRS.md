# Software Requirements Specification (SRS) for Avaya Udyog Website

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) document provides a detailed description of the requirements for the Avaya Udyog website, a futuristic, premium web presence for an interior design and decoration company. The website will serve as a marketing platform, portfolio showcase, contact capture tool, and admin-managed content system. It aims to attract potential clients, showcase services, and facilitate inquiries while ensuring a modern, accessible, and secure user experience.

The primary goals are:
- Establish a strong online brand presence for Avaya Udyog.
- Provide an intuitive platform for visitors to explore services, portfolio, and request quotes.
- Enable efficient admin management of galleries, projects, and contact submissions.
- Ensure compliance with web standards for performance, security, accessibility, and SEO.

### 1.2 Scope
The website will include:
- Public-facing pages: Home, About, Services, Portfolio, Project Details, Quote Estimator, Contact, Blog, Careers, Terms/Privacy/Accessibility.
- Admin area: Dashboard, Project/Gallery Management, Service Management, Contact Inquiries, Team Management, Site Settings, Blog CMS, User/Roles Management.
- Key features: Contact form with email notifications, state-changeable galleries, quote requests, 3D/AR integrations, responsive design.
- Integrations: Email sending (SendGrid/Mailgun), image storage (AWS S3/Cloudinary), analytics (GA4), monitoring (Sentry).

Out of scope:
- Physical product sales or e-commerce functionality.
- Advanced AR/VR beyond basic 3D model viewers.
- Multi-language support (initially English only).
- Third-party integrations beyond specified (e.g., no CRM sync initially).

### 1.3 Definitions, Acronyms, and Abbreviations
- **API**: Application Programming Interface
- **AR**: Augmented Reality
- **CMS**: Content Management System
- **DB**: Database
- **GA4**: Google Analytics 4
- **JWT**: JSON Web Token
- **SDLC**: Software Development Life Cycle
- **SEO**: Search Engine Optimization
- **SRS**: Software Requirements Specification
- **UAT**: User Acceptance Testing
- **UX**: User Experience
- **WCAG**: Web Content Accessibility Guidelines

### 1.4 References
- Company Flyer: `/mnt/data/avaya udyog.pdf` (source for branding, contact info, services).
- WCAG 2.1 AA Guidelines: https://www.w3.org/TR/WCAG21/
- OWASP Top 10: https://owasp.org/www-project-top-ten/

## 2. Overall Description

### 2.1 Product Perspective
The Avaya Udyog website is a standalone web application designed to replace or complement existing marketing materials. It integrates with external services for email, image storage, and analytics. The system consists of a frontend (React/Next.js), backend (Node.js/Express), and database (PostgreSQL).

### 2.2 Product Functions
- **Public Functions**:
  - Browse and filter portfolio galleries.
  - View project details with before/after sliders and 3D embeds.
  - Submit contact forms and quote requests.
  - Access blog posts and company information.
- **Admin Functions**:
  - Manage projects, galleries, and images (publish/unpublish, reorder).
  - View and moderate contact submissions.
  - Edit site content via CMS.
  - Configure site settings (emails, social links).

### 2.3 User Characteristics
- **Visitors**: General public, potential clients; assume basic web literacy, mobile and desktop access.
- **Admins**: Company staff; assume familiarity with web interfaces, no advanced technical skills required.

### 2.4 Constraints
- Must be responsive (mobile-first design).
- Compliance with WCAG 2.1 AA.
- Use specified tech stack (React, Node.js, PostgreSQL).
- Budget and timeline constraints (assume standard web development cycles).
- Data privacy: Adhere to GDPR/CCPA for contact data.

### 2.5 Assumptions and Dependencies
- High-resolution images and content provided by the company.
- Domain and email services available.
- External APIs (SendGrid, S3) accessible with valid accounts.
- Admin users trained on CMS usage.

## 3. Specific Requirements

### 3.1 External Interface Requirements

#### 3.1.1 User Interfaces
- **Responsive Design**: Desktop (1200px+), tablet (768-1199px), mobile (<768px).
- **Navigation**: Sticky navbar with mega menu, breadcrumb navigation.
- **Forms**: Accessible forms with validation feedback, CAPTCHA for spam prevention.
- **Galleries**: Lazy-loaded images, lightbox viewer, filter controls.
- **Admin UI**: Dashboard with grids, modals for editing, drag-and-drop for reordering.

#### 3.1.2 Hardware Interfaces
- Standard web browsers (Chrome, Firefox, Safari, Edge).
- No specific hardware requirements beyond internet-connected devices.

#### 3.1.3 Software Interfaces
- **Frontend**: React/Next.js with TailwindCSS.
- **Backend**: Node.js/Express with PostgreSQL.
- **Email**: SendGrid API for transactional emails.
- **Storage**: AWS S3 for images.
- **Analytics**: GA4 via gtag.

#### 3.1.4 Communication Interfaces
- HTTPS for all communications.
- RESTful API for frontend-backend interaction.
- WebSockets optional for real-time admin notifications.

### 3.2 Functional Requirements

#### 3.2.1 Visitor Functions
- **F-1**: Home page displays hero section, services overview, featured projects, and CTA.
- **F-2**: Contact form submission: Validates input, stores in DB, sends email to info.avayaudyog@gmail.com, returns success/error response.
- **F-3**: Portfolio gallery: Filter by category/status, lazy-load images, open in lightbox.
- **F-4**: Project detail: Displays images, specs, before/after slider, 3D/AR viewer.
- **F-5**: Quote estimator: Multi-step form, saves request, emails team.
- **F-6**: Blog: List and detail pages with SEO meta tags.

#### 3.2.2 Admin Functions
- **F-7**: Authentication: Login with JWT, role-based access (admin/super-admin).
- **F-8**: Gallery Management: Upload images, set state (draft/published/archived), reorder, bulk actions.
- **F-9**: Project Management: CRUD operations for projects, associate images.
- **F-10**: Contact Management: View submissions, mark as read, export to CSV.
- **F-11**: Site Settings: Update contact info, social links, email receivers.

### 3.3 Non-Functional Requirements

#### 3.3.1 Performance
- Page load time < 2s for 95% of requests.
- Image optimization: WebP/AVIF formats, responsive srcset.

#### 3.3.2 Security
- TLS 1.3 encryption.
- Input validation and sanitization.
- Rate limiting on public endpoints.
- Password hashing (bcrypt).
- OWASP Top 10 mitigations.

#### 3.3.3 Usability
- Intuitive navigation, consistent design.
- Accessibility: WCAG 2.1 AA (screen readers, keyboard navigation, color contrast).

#### 3.3.4 Reliability
- Uptime: 99.9%.
- Error handling: Graceful degradation, user-friendly error pages.

#### 3.3.5 Maintainability
- Modular code structure.
- Comprehensive documentation and tests.

### 3.4 Acceptance Criteria
- All functional requirements implemented and tested.
- Lighthouse scores: Performance >90, Accessibility >90, SEO >90.
- Contact form submissions result in DB storage and email delivery.
- Admin can publish/unpublish galleries with immediate site reflection.
- Cross-browser compatibility verified.

## 4. Appendices

### 4.1 Data Model
Refer to Section 6 in the original plan for table schemas.

### 4.2 API Specification
Refer to Section 7 in the original plan for endpoint details.

### 4.3 Sample Code
Refer to Section 8 in the original plan for contact form implementation.

This SRS serves as the foundation for development. Any changes must be documented and approved.
