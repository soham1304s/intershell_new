# Internshell

A comprehensive full-stack Internship & Job Management Platform built with React.js (Frontend) and Node.js/Express (Backend), featuring AI-powered resume analysis, coding tests, and career guidance.

## � Project Overview

**Internshell** is an advanced job and internship portal that bridges the gap between employers and job seekers. It leverages AI technologies (Google Gemini, OpenAI) for intelligent resume analysis, interview preparation, and candidate matching.

### Tech Stack
- **Frontend:** React.js, Redux, Material-UI, Vite, Socket.io-client
- **Backend:** Node.js, Express.js, MongoDB, Socket.io
- **AI Services:** Google Generative AI (Gemini), OpenAI GPT
- **Authentication:** JWT, Google OAuth 2.0
- **Payment Gateway:** Razorpay
- **Email Service:** Nodemailer
- **Cloud Storage:** Firebase

---

## �🚀 Key Features

### For Interns & Job Seekers
- **Resume Builder** - Create professional resumes with 10+ templates
- **Job Search & Apply** - Browse and apply for jobs/internships
- **ATS Checker** - Analyze resume compatibility with job postings
- **AI Interview Prep** - Practice interviews with AI assistance
- **Coding Tests** - Take and submit coding challenges
- **Career Guidance** - Get AI-powered career recommendations
- **Messaging System** - Direct communication with employers
- **Dashboard** - Track applications and profile statistics
- **Profile Management** - Build and manage your professional profile
- **User Authentication** - JWT & Google OAuth login

### For Employers & Admins
- **Job Management** - Post and manage job listings
- **Application Tracking** - Review and track candidates
- **Auto-Shortlisting** - AI-powered candidate matching
- **Incentive Management** - Manage referral incentives
- **Payment Processing** - Handle subscriptions and payments
- **Admin Dashboard** - Manage jobs, users, applications, and site statistics
- **Real-time Notifications** - Socket.io powered updates

## � Project Workflow Architecture

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                 │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐          │
│  │   Auth UI   │  │  Job Portal │  │ Resume Builder │          │
│  └─────────────┘  └─────────────┘  └────────────────┘          │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐          │
│  │  Dashboard  │  │  Messaging  │  │  ATS Checker   │          │
│  └─────────────┘  └─────────────┘  └────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                    HTTP/REST & WebSocket
                              │
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (Node + Express)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API Routes (20+ routes)                                │  │
│  │  Auth│Jobs│Applications│Profile│Payment│Messages│Admin  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│  ┌──────────────┐  ┌─────────────────┐  ┌──────────────────┐ │
│  │ Controllers  │  │    Middleware   │  │ Socket.io Events│ │
│  │ (18+ files)  │  │ (Auth, Validate)│  │ (Real-time Chat)│ │
│  └──────────────┘  └─────────────────┘  └──────────────────┘ │
│                              │                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Business Logic Services                                 │  │
│  │  Email│AI Analysis│Payment Processing│Job Matching      │  │
│  │  Schedulers│Notifications│Video Generation              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
└──────────────────────────────┼──────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
         ┌────▼───┐      ┌────▼────┐    ┌───▼─────┐
         │ MongoDB │      │ Firebase│    │AI Services
         │ Database│      │ Storage │    │Gemini/GPT
         └─────────┘      └─────────┘    └─────────┘
                              │
              ┌─────────────────────────────┐
              │ Other Services              │
              │ - Email (Nodemailer)       │
              │ - Payment (Razorpay)       │
              │ - Google OAuth              │
              └─────────────────────────────┘
```

### 1️⃣ Authentication Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER AUTHENTICATION FLOW                 │
└─────────────────────────────────────────────────────────────┘

STEP 1: REGISTRATION
├─ User selects role: Intern / Employer / Admin
├─ Submit: name, email, password, role, phone (employer: companyName)
├─ Validation checks:
│  ├─ Email format & uniqueness
│  ├─ Password strength (min 6 chars)
│  └─ Employer email domain validation (no @gmail.com, @yahoo.com, etc.)
├─ Password encrypted with bcrypt
├─ Create User in MongoDB with role='pending'
├─ Send verification email with OTP code
└─ Return success/error message

STEP 2: EMAIL VERIFICATION
├─ User clicks verification link in email
├─ Enters 6-digit OTP code
├─ Backend verifies code & tokenExpiry
├─ Update User: isEmailVerified=true
├─ Role updated from 'pending' to actual role
└─ Redirect to login

STEP 3: LOGIN - JWT Method
├─ User enters email & password
├─ Backend validates credentials
├─ Compare password with bcrypt
├─ Generate JWT token (includes userId, role, email)
├─ Return: { token, user: {id, name, role, email} }
├─ Frontend stores token in localStorage
└─ Add Authorization header for future API calls

STEP 4: LOGIN - Google OAuth
├─ User clicks "Login with Google"
├─ Frontend redirects to Google OAuth
├─ User consents and Google returns code
├─ Backend exchanges code for Google profile
├─ Check if User exists by googleId
├─ If not exists:
│  ├─ Create new User with googleId
│  ├─ Role = 'intern' (default)
│  └─ Automatically verified
├─ Generate JWT token
└─ Return token & redirect to dashboard

STEP 5: TOKEN MANAGEMENT
├─ JWT stored in localStorage
├─ Token expires in 7 days
├─ Refresh token endpoint for token renewal
├─ Logout: clear token from client & server sessions
└─ All API calls include: Authorization: Bearer {token}

SECURITY LAYERS:
├─ Password hashing: bcrypt with salt rounds
├─ Email verification required before full access
├─ JWT secret stored securely in environment
├─ Role-based access control (intern/employer/admin)
└─ HTTP-only cookies for token storage (optional enhancement)
```

### 2️⃣ Job Application Workflow

```
┌─────────────────────────────────────────────────────────────┐
│              JOB DISCOVERY & APPLICATION FLOW               │
└─────────────────────────────────────────────────────────────┘

STEP 1: JOB SEARCH (Intern/Jobseeker)
├─ Browse homepage with featured jobs
├─ Advanced search filters:
│  ├─ Location (50+ Indian cities)
│  ├─ Job type (Full-time, Part-time, Internship, Contract)
│  ├─ Experience level
│  ├─ Salary range
│  ├─ Skills required
│  ├─ Remote/On-site preference
│  └─ Company name
├─ AI-powered job recommendations
│  ├─ Match against user skills & experience
│  ├─ Score: % match with job requirements
│  └─ Sort by relevance
└─ View job details (description, skills, benefits)

STEP 2: JOB POSTING (Employer/Admin)
├─ Click "Post a Job"
├─ Fill job form:
│  ├─ Title, Company, Description
│  ├─ Location (required), Job type
│  ├─ Requirements (array), Responsibilities
│  ├─ Skills needed, Benefits, Salary
│  ├─ Experience level, Deadline
│  └─ Assessment/Coding test link (optional)
├─ Validation: all required fields
├─ Save to Job collection in MongoDB
├─ Generate job slug for SEO
├─ Create notification: "New job posted"
├─ Notify matching candidates
└─ Update site statistics

STEP 3: APPLICATION SUBMISSION
├─ User clicks "Apply Now" button
├─ Pre-fill with user profile data:
│  ├─ Name, Email, Phone, Location
│  ├─ Resume (auto-attach latest)
│  ├─ Cover letter (optional)
│  └─ Years of experience
├─ User can edit and submit
├─ Frontend validation: required fields
├─ Backend validation & duplicate check
│  ├─ Check if already applied for this job
│  └─ Prevent multiple applications
├─ Create Application record:
│  ├─ applicantId, jobId, status='applied'
│  ├─ resumeUrl, coverLetter, submittedAt
│  └─ Screening scores (initially empty)
├─ Send confirmation email to user
├─ Notify employer: "New application"
└─ Update user dashboard with new application

STEP 4: APPLICATION TRACKING (Employer)
├─ View all applications for job
├─ Status pipeline:
│  ├─ Applied → Shortlisted → Interview → Offered → Accepted/Rejected
│  └─ Can be rejected at any stage
├─ Per-application features:
│  ├─ View applicant resume & profile
│  ├─ Add screening notes
│  ├─ Rate candidate (5-star system)
│  ├─ Schedule interview
│  ├─ Send email updates
│  └─ Reject/Move to next stage
├─ Bulk actions:
│  ├─ Auto-shortlist (AI-powered)
│  ├─ Reject all
│  ├─ Schedule group interviews
│  └─ Export applications (CSV/Excel)
└─ Analytics: applications per job, conversion funnel

STEP 5: APPLICATION TRACKING (Intern)
├─ View "Applied Jobs" in dashboard
├─ For each application see:
│  ├─ Current status with progress indicator
│  ├─ Job details & company info
│  ├─ Applied date & last update
│  ├─ Application response from employer
│  └─ Interview schedule (if applicable)
├─ Actions:
│  ├─ View full job posting
│  ├─ Withdraw application
│  ├─ Add cover letter
│  └─ Check ATS score for this job
└─ Notifications: Status updates via email & in-app

STEP 6: AUTO-SHORTLISTING (AI-Powered)
├─ Employer clicks "AI Shortlist" button
├─ System analyzes all applications:
│  ├─ Extract skills from resume/profile
│  ├─ Match against job requirements
│  ├─ Score each candidate (0-100)
│  ├─ Consider experience level match
│  └─ Rank by match percentage
├─ Generate shortlist (e.g., top 10 candidates)
├─ Employer reviews AI recommendations
├─ Manually approve/override selections
├─ Send offer letters to shortlisted
└─ Notify rejected candidates

STEP 7: INTERVIEW SCHEDULING
├─ From shortlisted applicants:
│  ├─ Employer selects candidates
│  ├─ Choose interview type:
│  │  ├─ Technical (coding test)
│  │  ├─ HR (behavioral)
│  │  └─ Video (recorded)
│  ├─ Set interview date & time (calendar sync)
│  ├─ Add meeting link (Zoom/Google Meet)
│  └─ Add interview guidelines
├─ Send interview notification to candidate
├─ Candidate receives:
│  ├─ Date, time, duration
│  ├─ Interview type & focus areas
│  ├─ Meeting link & instructions
│  └─ Pre-interview resources
├─ Reminder emails (1 day before, 1 hour before)
└─ Create Interview record in DB
```

### 3️⃣ AI-Powered Features Workflow

```
┌─────────────────────────────────────────────────────────────┐
│          AI RESUME ANALYSIS & OPTIMIZATION FLOW             │
└─────────────────────────────────────────────────────────────┘

STEP 1: RESUME UPLOAD & PARSING
├─ User uploads resume (PDF/DOCX)
├─ File validation:
│  ├─ Max size: 5MB
│  ├─ Allowed formats: PDF, DOCX, DOC
│  └─ Virus scan (if enabled)
├─ Store in Firebase Storage
├─ Parse document content:
│  ├─ PDF parsing: pdf-parse library
│  ├─ DOCX parsing: mammoth library
│  ├─ Extract text content
│  └─ Generate preview
├─ Save resume URL to User model
└─ Send to AI analyzer

STEP 2: ATS SCORE CHECKING
├─ User provides:
│  ├─ Resume (uploaded)
│  ├─ Job posting (link or paste)
│  └─ Target role/skills
├─ Extract job requirements using AI
├─ Analyze resume for:
│  ├─ Keyword matching with job requirements
│  ├─ Format compatibility (ATS-friendly format)
│  ├─ Section completeness (summary, skills, experience)
│  ├─ Skills match percentage (0-100%)
│  └─ Missing key skills & certifications
├─ Generate ATS Report:
│  ├─ Overall score (e.g., 82%)
│  ├─ Matched keywords list
│  ├─ Missing keywords list
│  ├─ Format issues (if any)
│  ├─ Improvement suggestions
│  └─ Optimized resume version (if enabled)
├─ Save to AIAnalysis collection
└─ Return detailed report to user

STEP 3: RESUME OPTIMIZATION (AI-Powered)
├─ System identifies:
│  ├─ Weak bullet points in experience
│  ├─ Missing technical skills
│  ├─ Poor formatting for ATS
│  ├─ Vague descriptions
│  └─ Industry-specific keywords
├─ Use Google Gemini API to:
│  ├─ Rewrite weak experience descriptions
│  ├─ Suggest high-impact action verbs
│  ├─ Add relevant keywords naturally
│  ├─ Improve quantifiable achievements
│  └─ Suggest skills to highlight
├─ Generate optimization suggestions
├─ User can:
│  ├─ Accept all suggestions
│  ├─ Pick and choose improvements
│  ├─ Edit manually
│  └─ Regenerate suggestions
└─ Save optimized resume version

STEP 4: CAREER GUIDANCE (AI-Powered)
├─ User provides:
│  ├─ Current role & experience level
│  ├─ Skills & interests
│  ├─ Career goals
│  └─ Constraints (location, salary, etc.)
├─ System uses OpenAI to analyze:
│  ├─ Current market trends in user's domain
│  ├─ Required skills for next role
│  ├─ Recommended learning paths
│  ├─ Salary expectations by location & level
│  ├─ Companies hiring in user's area
│  └─ Alternative career paths
├─ Generate Career Guidance report:
│  ├─ Current role analysis
│  ├─ 3-5 recommended next roles
│  ├─ Skills gap analysis
│  ├─ 6-month learning roadmap
│  ├─ Networking recommendations
│  └─ Salary benchmarking
├─ Store in CareerGuidance collection
└─ User can save & share report

STEP 5: AI INTERVIEW PREPARATION
├─ User selects:
│  ├─ Interview type (Technical, HR, Behavioral)
│  ├─ Company (auto-fetch common questions)
│  ├─ Role & experience level
│  └─ Focus areas (optional)
├─ System uses Gemini/GPT to generate:
│  ├─ 10-15 relevant interview questions
│  ├─ Model answers for each question
│  ├─ Follow-up questions
│  ├─ Common mistakes to avoid
│  └─ Interview preparation tips
├─ User practices:
│  ├─ Read question
│  ├─ Record video answer (optional)
│  ├─ Submit text answer
│  ├─ Receive AI feedback on answer
│  ├─ Receive score (0-100)
│  └─ Suggested improvements
├─ AI evaluates answer on:
│  ├─ Relevance to question
│  ├─ Completeness & clarity
│  ├─ Technical accuracy
│  ├─ Communication quality
│  └─ Examples & evidence
├─ Generate practice report:
│  ├─ Question-wise scores
│  ├─ Overall readiness score
│  ├─ Weak areas to focus
│  ├─ Resource recommendations
│  └─ Success probability estimate
└─ Store results in Interview collection

STEP 6: PERSONALIZED JOB RECOMMENDATIONS
├─ System collects user data:
│  ├─ Skills from profile
│  ├─ Experience & education
│  ├─ Previous applications & rejections
│  ├─ ATS scores & performance
│  ├─ Career guidance goals
│  └─ View history & interests
├─ AI-powered matching algorithm:
│  ├─ Score each active job (0-100)
│  ├─ Match skills with job requirements
│  ├─ Consider experience level fit
│  ├─ Factor in location preference
│  ├─ Analyze growth potential
│  └─ Estimate success probability
├─ Generate recommendations:
│  ├─ Top 5-10 matching jobs
│  ├─ Match percentage for each job
│  ├─ Why recommended (key factors)
│  ├─ Application success estimate
│  └─ Skill gaps to address
├─ Send daily/weekly digest to user
└─ Update in real-time as user applies/interviews
```

### 4️⃣ Payment & Subscription Workflow

```
┌─────────────────────────────────────────────────────────────┐
│            PAYMENT & SUBSCRIPTION MANAGEMENT                │
└─────────────────────────────────────────────────────────────┘

SUBSCRIPTION PLANS:
├─ Free Plan:
│  ├─ Browse jobs & apply (5 applications/month)
│  ├─ Basic profile
│  ├─ 1 ATS check/month
│  └─ Limited AI features
├─ Premium Plan (₹299/month or ₹2999/year):
│  ├─ Unlimited job applications
│  ├─ Advanced ATS Checker
│  ├─ AI Interview Practice (unlimited)
│  ├─ Career Guidance (monthly)
│  ├─ Resume Optimization
│  ├─ Priority support
│  └─ Job alerts & recommendations
└─ Pro Plan (₹699/month or ₹6999/year):
   ├─ All Premium features
   ├─ Video interview practice
   ├─ 1-on-1 mentorship (limited)
   ├─ Cover letter assistance
   ├─ Salary negotiation guide
   └─ Portfolio review

STEP 1: SUBSCRIPTION INITIATION
├─ User clicks "Upgrade to Premium"
├─ Show pricing plans with comparison
├─ User selects plan & billing cycle (monthly/yearly)
├─ Redirect to payment gateway:
│  ├─ Frontend creates Razorpay order
│  ├─ Send: amount, plan_id, user_id
│  ├─ Receive: order_id from backend
│  └─ Open Razorpay payment modal
├─ User enters payment details
└─ Razorpay processes payment

STEP 2: PAYMENT PROCESSING (via Razorpay)
├─ Card/UPI/Wallet payment validation
├─ Razorpay authenticates transaction
├─ Payment success/failure webhook to backend
├─ Backend receives webhook:
│  ├─ Verify signature (secure)
│  ├─ Update Payment record status
│  ├─ Create Invoice
│  ├─ Activate subscription:
│  │  ├─ Update User.subscription
│  │  ├─ Set expiryDate
│  │  ├─ Unlock premium features
│  │  └─ Set featureAccess flags
│  ├─ Generate invoice PDF
│  └─ Send confirmation email with invoice
├─ Frontend receives confirmation
├─ Show success message
└─ Redirect to dashboard

STEP 3: AUTO-RENEWAL (Scheduled)
├─ Cron job runs daily (autopayScheduler.js)
├─ Check subscriptions expiring in 3 days
├─ For each expiring subscription:
│  ├─ Verify payment method exists
│  ├─ Send renewal reminder email
│  ├─ Include: plan details, price, renewal date
│  └─ Provide renewal link
├─ User clicks renewal link:
│  ├─ Create new payment order
│  ├─ Process same as new subscription
│  ├─ Extend subscription by 1 cycle
│  └─ Send renewal confirmation
└─ If payment fails:
   ├─ Send retry notification
   ├─ Retry after 3 days
   ├─ If still fails, downgrade to Free plan
   └─ Notify user of downgrade

STEP 4: SUBSCRIPTION MANAGEMENT
├─ User can:
│  ├─ View current plan & remaining days
│  ├─ Download past invoices
│  ├─ Update payment method
│  ├─ Upgrade/downgrade plan
│  ├─ Cancel subscription (with reason)
│  └─ Pause subscription (3 months max)
├─ Downgrade:
│  ├─ Takes effect at next billing cycle
│  ├─ Pro-rated refund if applicable
│  ├─ Features reduced gradually
│  └─ User warned about feature loss
├─ Cancellation:
│  ├─ Send cancellation feedback form
│  ├─ Option to pause instead of cancel
│  ├─ Access until billing period ends
│  ├─ Send win-back offer (discount)
│  └─ Remove from auto-renew
└─ Pause:
   ├─ Temporary stop (up to 3 months)
   ├─ Subscription paused, not cancelled
   ├─ Resume at any time
   └─ Extend pause date if needed

STEP 5: INCENTIVE MANAGEMENT (Referral)
├─ Referral program:
│  ├─ Refer friend: Get ₹100 credit
│  ├─ Friend uses code: Get 10% off first month
│  ├─ Maximum: ₹2000 credits/month per user
│  └─ Credits apply to next renewal
├─ Referral tracking:
│  ├─ Generate unique referral code per user
│  ├─ Track referral clicks & signups
│  ├─ Create Incentive record for each conversion
│  ├─ Send confirmation email
│  ├─ Add credit to referrer's account
│  └─ Show referral status in dashboard
├─ Credit redemption:
│  ├─ Automatic application at next renewal
│  ├─ If credit > renewal cost: extend period
│  ├─ Otherwise: charge only remaining balance
│  └─ Track credit balance per user
└─ Cron job (incentiveScheduler.js):
   ├─ Expire old incentive records (90 days)
   ├─ Process new referral bonuses
   ├─ Update credit balances
   └─ Send expiry warnings

DATA MODELS:
├─ Payment: amount, status, method, transactionId, plan, period
├─ Invoice: invoiceNumber, amount, dueDate, status, pdfUrl
├─ Subscription: plan, startDate, expiryDate, status, autoRenew
└─ Incentive: referrerId, refereeId, credit, expiryDate, used
```

### 5️⃣ Real-time Messaging Workflow (Socket.io)

```
┌─────────────────────────────────────────────────────────────┐
│           REAL-TIME MESSAGING & NOTIFICATIONS                │
└─────────────────────────────────────────────────────────────┘

WEBSOCKET CONNECTION:
├─ Frontend connects: socket.io client
├─ Backend accepts: socket.io server
├─ Handshake exchanges: user_id, role, connection_time
├─ Store socket.id mapped to user_id
└─ Connection pooling: support multiple tabs

MESSAGING FLOW:
├─ User A wants to message Employer B
├─ Actions:
│  ├─ Click "Message Employer"
│  ├─ Open chat window / message form
│  ├─ Type message
│  ├─ Attach file (optional): resume, portfolio
│  └─ Click Send
├─ Frontend emits Socket event: 'send_message'
│  ├─ Event data: { recipientId, message, attachment, timestamp }
│  ├─ Send via HTTP: POST /api/messages
│  └─ Store in Message collection
├─ Backend processes:
│  ├─ Validate sender & recipient
│  ├─ Create Message record:
│  │  ├─ senderId, recipientId, content
│  │  ├─ timestamp, isRead=false
│  │  └─ attachment (if present)
│  ├─ Save to database
│  ├─ Emit Socket event to recipient: 'receive_message'
│  └─ Event data: { senderId, message, timestamp, sender_details }
├─ Recipient receives real-time notification:
│  ├─ If online: instant notification popup
│  ├─ If offline: store notification, show on login
│  ├─ Sound/vibration alert (if enabled)
│  └─ Badge count increment
└─ Mark as read:
   ├─ User opens message / reads it
   ├─ Frontend emits: 'mark_read'
   ├─ Backend updates: Message.isRead=true
   ├─ Emit back to sender: 'message_read_confirmation'
   └─ Update timestamp for read_at

CONVERSATION MANAGEMENT:
├─ Fetch conversations:
│  ├─ User clicks "Messages" tab
│  ├─ Frontend calls: GET /api/messages/
│  ├─ Backend returns:
│  │  ├─ List of all conversations (sorted by latest)
│  │  ├─ Last message preview
│  │  ├─ Unread count
│  │  ├─ Participant details
│  │  └─ Timestamp of last message
│  └─ Display conversation list
├─ Open conversation:
│  ├─ Click specific conversation
│  ├─ Frontend calls: GET /api/messages/{conversationId}
│  ├─ Backend loads: all messages in conversation (paginated)
│  ├─ Display message history
│  ├─ Join Socket room: 'conversation_{conversationId}'
│  └─ Auto-load new messages via Socket
├─ Archive conversation:
│  ├─ Right-click / swipe → Archive
│  ├─ Hides from main list, keeps in archive
│  ├─ Can unarchive later
│  └─ Soft delete (not actually deleted)
└─ Delete conversation:
   ├─ Confirm: "Delete all messages?"
   ├─ Hard delete from both users' views
   ├─ Cannot be recovered
   └─ Create audit log entry

NOTIFICATIONS SYSTEM:
├─ Types of notifications:
│  ├─ New message: "John sent you a message"
│  ├─ Job update: "Employer shortlisted you for ABC job"
│  ├─ Application status: "Your application was accepted"
│  ├─ Interview scheduled: "Interview on Dec 15, 2pm"
│  ├─ Payment receipt: "Your payment of ₹299 received"
│  ├─ AI analysis ready: "Your resume analysis is ready"
│  └─ New job match: "3 jobs match your profile"
├─ Notification delivery channels:
│  ├─ In-app: Real-time badge & notification center
│  ├─ Email: HTML email with call-to-action
│  ├─ Push: Browser push notification
│  ├─ SMS: SMS gateway (if enabled)
│  └─ Webhook: For third-party integrations
├─ Real-time notifications (Socket.io):
│  ├─ Server emits: 'notification'
│  ├─ Client receives & displays
│  ├─ Update notification badge count
│  ├─ Store in Notification collection
│  ├─ User marks read: PUT /api/notifications/{id}/read
│  └─ Filter old notifications after 30 days
└─ Notification preferences:
   ├─ User settings: which notifications to receive
   ├─ Quiet hours: no notifications 10pm-8am
   ├─ Frequency: instant, daily digest, weekly digest
   ├─ Channels: email, push, SMS (selective)
   └─ Save preferences in User profile

OFFLINE MESSAGE HANDLING:
├─ If user offline when message sent:
│  ├─ Store message in Message collection
│  ├─ Create Notification record
│  ├─ Send email notification
│  ├─ On next login: fetch pending messages
│  ├─ Display as new messages
│  └─ Emit 'new_messages_pending' event
└─ Connection interruption handling:
   ├─ Network disconnected: queue messages locally
   ├─ Reconnect: send queued messages
   ├─ Receive pending messages from server
   └─ Sync timestamps & read status
```

### 6️⃣ Admin Dashboard Workflow

```
┌─────────────────────────────────────────────────────────────┐
│              ADMIN PANEL & MANAGEMENT                       │
└─────────────────────────────────────────────────────────────┘

ADMIN AUTHENTICATION:
├─ Only users with role='admin' can access
├─ Separate login page: /admin/login
├─ Extra verification: 2FA (optional)
├─ Session timeout after 30 mins inactivity
└─ Audit log: all admin actions logged

ADMIN DASHBOARD SECTIONS:

1. USERS MANAGEMENT
├─ View all users:
│  ├─ Filter: Interns, Employers, Admins, Blocked
│  ├─ Search: by name, email, company
│  ├─ Sort: by joinDate, lastActive, role
│  └─ Pagination: 20 per page
├─ User details:
│  ├─ Profile info, contact details
│  ├─ Subscription status & plan
│  ├─ Application history
│  ├─ Account balance/credits
│  ├─ Last activity & login time
│  └─ Notes / internal comments
├─ User actions:
│  ├─ Block/Unblock user
│  ├─ Verify email (admin verification)
│  ├─ Reset password (send reset link)
│  ├─ Change role (with confirmation)
│  ├─ Add/Remove subscription manually
│  ├─ Apply credit/discount
│  ├─ View activity log
│  └─ Delete user account (with data cleanup)
└─ Export: User list (CSV/Excel)

2. JOBS MANAGEMENT
├─ View all jobs:
│  ├─ Filter: Active, Expired, Drafted, Closed
│  ├─ Search: by title, company, location
│  ├─ Sort: by postDate, applications, lastUpdated
│  └─ Pagination
├─ Job moderation:
│  ├─ Review new jobs before publishing
│  ├─ Check for spam/inappropriate content
│  ├─ Verify company details
│  ├─ Approve / Reject with reason
│  └─ Edit job details (if needed)
├─ Job actions:
│  ├─ Feature job (boost visibility)
│  ├─ Bump job (move to top)
│  ├─ Extend deadline
│  ├─ Close early / Hide job
│  ├─ Duplicate job (repost)
│  ├─ Send to matching candidates
│  ├─ View applications & stats
│  └─ Delete job (with reason)
├─ Analytics per job:
│  ├─ Views, Clicks, Applications
│  ├─ Conversion funnel
│  ├─ Quality of applications
│  └─ Time to hire
└─ Bulk actions: Feature/Bump/Hide multiple jobs

3. APPLICATIONS MANAGEMENT
├─ View all applications:
│  ├─ Filter: by status, job, date range
│  ├─ Search: by candidate name, job title
│  ├─ Sort: by date, status, applicant
│  └─ Pagination
├─ Application review:
│  ├─ View candidate resume & profile
│  ├─ See application form & answers
│  ├─ Check ATS score (if available)
│  ├─ See all interactions (messages, notes)
│  └─ Interview schedule (if assigned)
├─ Actions:
│  ├─ Update status (with email notification)
│  ├─ Add notes for team
│  ├─ Flag suspicious applications
│  ├─ Archive application
│  ├─ Delete application
│  └─ Send bulk email (all similar status)
└─ Funnel analytics: Applied → Shortlisted → Offer → Hired

4. PAYMENTS & SUBSCRIPTIONS
├─ Payment transactions:
│  ├─ View all transactions (filter: pending, success, failed)
│  ├─ Search: by user, amount, date range
│  ├─ See transaction details:
│  │  ├─ Order ID, Transaction ID
│  │  ├─ Amount, Plan, Period
│  │  ├─ Payment method, Status
│  │  └─ User details & email
│  ├─ Actions:
│  │  ├─ Resend receipt email
│  │  ├─ Refund (full/partial)
│  │  ├─ Mark as manual payment
│  │  └─ Investigate failed payments
│  └─ Bulk actions: Export CSV
├─ Subscriptions:
│  ├─ View active subscriptions
│  ├─ Filter: by plan, expiring soon, about to auto-renew
│  ├─ Search: by user email
│  ├─ For each subscription:
│  │  ├─ Plan details, start date, expiry
│  │  ├─ Auto-renew status
│  │  ├─ Previous renewals & next renewal date
│  │  └─ Total value per user (lifetime)
│  ├─ Actions:
│  │  ├─ Extend subscription (manual)
│  │  ├─ Cancel subscription
│  │  ├─ Change plan
│  │  ├─ Pause/Resume
│  │  └─ Apply credit/discount
│  └─ Analytics: MRR, churn rate, LTV
├─ Invoices:
│  ├─ View all invoices
│  ├─ Download PDF
│  ├─ Send to user email
│  └─ Mark as paid
└─ Refunds management:
   ├─ Process refunds to payment gateway
   ├─ Store refund reasons
   ├─ Track refund status
   └─ Send refund confirmation email

5. SITE STATISTICS
├─ Overview metrics:
│  ├─ Total users (Interns, Employers)
│  ├─ Active users (last 7 days, 30 days)
│  ├─ New signups (today, this week, this month)
│  ├─ Total jobs posted
│  ├─ Active jobs (currently hiring)
│  ├─ Total applications
│  ├─ Successful hires
│  ├─ Platform revenue (this month, total)
│  └─ Subscription churn rate
├─ Trend charts:
│  ├─ Signups trend (last 90 days)
│  ├─ Job postings trend
│  ├─ Application volume trend
│  ├─ Revenue trend
│  ├─ Subscription growth
│  └─ Feature usage trends (ATS, AI Interview, etc.)
├─ User demographics:
│  ├─ By role: Intern, Employer, Admin
│  ├─ By location (top 10 cities)
│  ├─ By skill (top 20)
│  ├─ By experience level
│  └─ By subscription status
├─ Job statistics:
│  ├─ By category (tech, finance, HR, etc.)
│  ├─ By location (top 15 cities)
│  ├─ Average applications per job
│  ├─ Average time to hire
│  ├─ Popular skills (top 20)
│  └─ Salary ranges by role
└─ Conversion funnel:
   ├─ Signup → Email verified
   ├─ Viewed jobs → Applied
   ├─ Applied → Shortlisted
   ├─ Shortlisted → Interviewed
   ├─ Interviewed → Offered
   ├─ Offered → Accepted
   └─ Calculate conversion % at each stage

6. CONTENT MANAGEMENT
├─ Email templates:
│  ├─ View default templates
│  ├─ Create custom templates
│  ├─ Test send email
│  ├─ Track open rates & clicks
│  └─ A/B test variants
├─ FAQ & Help:
│  ├─ Manage FAQ entries
│  ├─ Organize by categories
│  ├─ Track useful votes
│  └─ Monitor support tickets
├─ Notifications:
│  ├─ Create system-wide announcements
│  ├─ Schedule announcements
│  ├─ Target specific user groups
│  ├─ Track notification delivery
│  └─ Monitor open rates
└─ Pages:
   ├─ Manage landing pages
   ├─ Edit terms & privacy policy
   ├─ Update blog posts
   └─ Manage static content

7. SETTINGS & CONFIGURATION
├─ Platform settings:
│  ├─ Site name, logo, colors
│  ├─ Email configuration (SMTP)
│  ├─ Payment gateway settings
│  ├─ AI API keys & limits
│  ├─ Features toggle (enable/disable features)
│  └─ Maintenance mode
├─ User-facing settings:
│  ├─ Subscription plans (create, edit, delete)
│  ├─ Pricing & currencies
│  ├─ Feature access matrix (by role)
│  ├─ Email notification frequency
│  └─ Support email & phone
├─ Security settings:
│  ├─ 2FA requirements
│  ├─ Password policy
│  ├─ Session timeout
│  ├─ API rate limits
│  ├─ CORS whitelist
│  └─ Audit log retention
└─ Integrations:
   ├─ API keys management
   ├─ Webhook configuration
   ├─ Integration status (Google, Facebook, etc.)
   └─ Third-party service settings

AUDIT LOGGING:
├─ Log every admin action:
│  ├─ User, action, timestamp
│  ├─ Data changed (before & after)
│  ├─ IP address & user agent
│  ├─ Reason/comment
│  └─ Approval (if needed)
├─ Audit log viewer:
│  ├─ Filter: by admin, action type, date range
│  ├─ Search: by user affected, details
│  ├─ Export: CSV/JSON
│  └─ Archive old logs
└─ Alerts for suspicious actions:
   ├─ Unusual login location
   ├─ Multiple failed logins
   ├─ Bulk data changes
   ├─ Large refunds
   └─ Send alert email to super-admin
```

### 7️⃣ Background Processes & Schedulers

```
┌─────────────────────────────────────────────────────────────┐
│           AUTOMATED SCHEDULERS & BACKGROUND JOBS             │
└─────────────────────────────────────────────────────────────┘

AUTOPAY SCHEDULER (autopayScheduler.js):
├─ Runs: Daily at 2 AM (node-cron)
├─ Purpose: Auto-renew subscriptions & process refunds
├─ Steps:
│  1. Find subscriptions expiring in 3 days
│  2. For each subscription:
│     ├─ Check if auto-renew is enabled
│     ├─ Verify payment method exists
│     ├─ Create new payment order (same plan)
│     ├─ Charge user via Razorpay API
│     ├─ If successful:
│     │  ├─ Update subscription dates
│     │  ├─ Create new invoice
│     │  └─ Send confirmation email
│     └─ If failed:
│        ├─ Log attempt
│        ├─ Send retry reminder email
│        ├─ Retry after 3 days
│        └─ After 3 retries: downgrade to free plan
│  3. Process refunds:
│     ├─ Find refund requests approved by admin
│     ├─ Charge back to payment gateway
│     ├─ Update Payment status
│     └─ Send refund receipt email
│  4. Cleanup:
│     ├─ Archive expired subscriptions
│     ├─ Remove temp records
│     └─ Update statistics
└─ Error handling:
   ├─ Catch payment failures gracefully
   ├─ Log all errors with details
   ├─ Send alert email if > 10% failure rate
   └─ Retry failed transactions later

INCENTIVE SCHEDULER (incentiveScheduler.js):
├─ Runs: Daily at 3 AM (node-cron)
├─ Purpose: Process referral credits & clean up
├─ Steps:
│  1. Process new referrals:
│     ├─ Find referrals completed in last 24hrs
│     ├─ Verify both users meet criteria
│     ├─ Create Incentive record for referrer
│     ├─ Add credit to referrer account
│     ├─ Send notification to referrer
│     └─ Send discount offer to referree
│  2. Apply credits:
│     ├─ Find subscriptions about to renew
│     ├─ Check user's available credits
│     ├─ Automatically apply credits:
│     │  ├─ If credit >= renewal cost: extend period, zero out credit
│     │  ├─ If credit < renewal cost: charge only balance, zero out credit
│     │  └─ If no credit: charge full amount
│     └─ Update Payment & Subscription records
│  3. Expire old incentives:
│     ├─ Find incentives older than 90 days
│     ├─ If not used: mark as expired
│     ├─ Send "expiring soon" email (7 days before)
│     ├─ Update user credits
│     └─ Move to archive
│  4. Fraud detection:
│     ├─ Flag unusual referral patterns
│     ├─ Check for self-referrals
│     ├─ Investigate mass referrals
│     └─ Alert admin for review
└─ Error handling:
   ├─ Validate all credit calculations
   ├─ Log transactions with details
   ├─ Send admin alert on suspicious activity
   └─ Rollback on errors

EMAIL NOTIFICATIONS SCHEDULER:
├─ Daily digest emails:
│  ├─ Runs: 8 AM (morning digest)
│  ├─ Find: all users preferring daily digest
│  ├─ Compile: important updates from last 24hrs
│  │  ├─ New job matches (top 5)
│  │  ├─ Application status updates
│  │  ├─ New messages (summary)
│  │  ├─ Notifications (summary)
│  │  └─ Expiring soon: subscription, credits, opportunities
│  └─ Send: formatted HTML email
├─ Weekly digest emails:
│  ├─ Runs: Monday 8 AM
│  ├─ Find: users preferring weekly digest
│  ├─ Compile: weekly stats & trends
│  │  ├─ Jobs applied & responses
│  │  ├─ Profile views (if employer)
│  │  ├─ Upcoming interviews
│  │  ├─ Unread messages count
│  │  └─ Trending skills & roles
│  └─ Send: formatted email with stats
├─ Reminder emails:
│  ├─ Interview reminders (24 hours before)
│  ├─ Subscription expiry warnings (7 days before)
│  ├─ Incentive expiry warnings (7 days before)
│  ├─ Payment failures (if auto-renew failed)
│  ├─ Incomplete applications (if drafted)
│  ├─ Profile incomplete warnings (if < 50% complete)
│  └─ Inactive user re-engagement (after 30 days)
└─ Promotional emails:
   ├─ New feature announcements
   ├─ Holiday offers & discounts
│   ├─ Targeted by: location, skills, interests
│   └─ Unsubscribe option on every email

JOB EXPIRY SCHEDULER:
├─ Runs: Daily at 12 AM
├─ Purpose: Close expired job postings
├─ Steps:
│  1. Find jobs with deadline < today
│  2. For each expired job:
│     ├─ Update status to 'closed'
│     ├─ Archive from active listings
│     ├─ Notify employer: job expired
│     ├─ Show job in "Closed" filter only
│     └─ Still allow applications (optional)
│  3. Find jobs 14 days before expiry:
│     ├─ Send reminder to employer
│     ├─ Option to extend deadline
│     ├─ Option to repost job
│     └─ Highlight if no applications yet
└─ Update site statistics

STALE DATA CLEANUP:
├─ Runs: Weekly (Sunday 3 AM)
├─ Delete old records:
│  ├─ Chat history > 1 year old (archive first)
│  ├─ Temp files > 7 days old
│  ├─ Failed payment attempts > 90 days
│  ├─ Unverified registrations > 7 days
│  ├─ Expired OTP tokens
│  └─ Session tokens > expiry date
├─ Archive records:
│  ├─ Completed payments > 2 years
│  ├─ Closed applications > 1 year
│  └─ Inactive user data (with retention policy)
└─ Optimize database:
   ├─ Run MongoDB maintenance
   ├─ Rebuild indexes
   ├─ Vacuum collection
   └─ Generate fresh statistics

NOTIFICATION SENDER QUEUE:
├─ Real-time processing (not scheduled)
├─ Event-driven notifications:
│  ├─ Trigger: New application received
│  │  ├─ Send to: Employer via email, Socket.io
│  │  ├─ Data: applicant name, job title, link
│  │  └─ Delay: Immediate
│  ├─ Trigger: Application status changed
│  │  ├─ Send to: Applicant via email, Socket.io
│  │  ├─ Data: new status, next steps
│  │  └─ Delay: Immediate
│  ├─ Trigger: Message received
│  │  ├─ Send to: Recipient via Socket.io, email (digest)
│  │  ├─ Data: sender name, message preview
│  │  └─ Delay: Immediate (Socket), 6 hours (email)
│  ├─ Trigger: Interview scheduled
│  │  ├─ Send to: Both parties via email
│  │  ├─ Data: date, time, meeting link, instructions
│  │  └─ Delay: Immediately + reminders at T-1day, T-1hour
│  ├─ Trigger: Payment received
│  │  ├─ Send to: User via email with receipt & invoice
│  │  ├─ Data: plan, amount, invoice link
│  │  └─ Delay: Immediate
│  └─ Trigger: AI analysis complete
│     ├─ Send to: User via Socket.io + email
│     ├─ Data: report link, key findings
│     └─ Delay: Immediate
└─ Queue management:
   ├─ Retry failed notifications (up to 3 times)
   ├─ Log all notifications sent
   ├─ Track open rates & clicks
   └─ Prioritize critical notifications

PERFORMANCE MONITORING:
├─ Runs: Every 5 minutes
├─ Monitor:
│  ├─ API response times
│  ├─ Database query performance
│  ├─ Server CPU & memory usage
│  ├─ Active connections (users online)
│  ├─ Failed API calls
│  ├─ Error rates by endpoint
│  └─ Scheduled job completion status
├─ Alerts if:
│  ├─ Response time > 2 seconds
│  ├─ Error rate > 5%
│  ├─ Server memory > 80%
│  ├─ Database slow queries
│  ├─ Scheduled job fails
│  └─ Downtime detected
└─ Log to monitoring service (if configured)
```

---

## 📁 Project Structure
├── backend/                    # Node.js/Express API Server
│   ├── api/                   # API endpoint definitions
│   ├── config/                # Database and service configuration
│   ├── controllers/           # Business logic (18+ controllers)
│   │   ├── authController.js           # User auth & registration
│   │   ├── profileController.js        # User profiles
│   │   ├── jobController.js            # Job listings
│   │   ├── applicationController.js    # Job applications
│   │   ├── atsController.js            # ATS resume checker
│   │   ├── aiInterviewController.js    # AI interview prep
│   │   ├── aiAnalysisController.js     # AI analysis features
│   │   ├── codingTestController.js     # Coding tests
│   │   ├── messageController.js        # Messaging system
│   │   ├── paymentController.js        # Payment processing
│   │   ├── notificationController.js   # Notifications
│   │   ├── adminController.js          # Admin operations
│   │   ├── careerGuidanceController.js # Career advice
│   │   ├── autoShortlistController.js  # AI shortlisting
│   │   ├── dashboardController.js      # Dashboard data
│   │   └── more...
│   ├── middleware/            # Authentication & Authorization
│   │   ├── auth.js            # JWT verification
│   │   ├── adminAuth.js       # Admin role check
│   │   └── featureAccess.js   # Feature access control
│   ├── models/                # MongoDB Schemas (15+ models)
│   │   ├── User.js
│   │   ├── Job.js
│   │   ├── Application.js
│   │   ├── Interview.js
│   │   ├── CodingTest.js
│   │   ├── Payment.js
│   │   ├── Message.js
│   │   ├── Notification.js
│   │   ├── CareerGuidance.js
│   │   ├── AIAnalysis.js
│   │   ├── ChatHistory.js
│   │   ├── Subscriber.js
│   │   ├── Invoice.js
│   │   ├── Incentive.js
│   │   └── more...
│   ├── routes/                # API Routes (20+ route files)
│   │   ├── authRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── atsRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── more...
│   ├── scheduler/             # Background Tasks
│   │   ├── autopayScheduler.js
│   │   └── incentiveScheduler.js
│   ├── uploads/               # User Uploaded Files
│   │   ├── messages/
│   │   └── payment-screenshots/
│   ├── utils/                 # Utility Services
│   │   ├── emailService.js        # Email notifications
│   │   ├── geminiService.js       # Google Gemini API
│   │   ├── openaiService.js       # OpenAI integration
│   │   ├── jobMatcher.js          # AI job matching
│   │   ├── jwt.js                 # JWT token management
│   │   ├── socket.js              # Socket.io setup
│   │   ├── videoGenerator.js      # Video generation
│   │   └── more...
│   ├── package.json           # Dependencies
│   ├── server.js              # Main server entry
│   ├── server-fixed.js        # Production version
│   ├── server-minimal.js      # Minimal version for testing
│   └── env.txt                # Environment variables
│
└── frontend/                   # React.js + Vite Application
    ├── src/
    │   ├── views/Intern/      # Intern/Jobseeker Pages
    │   │   ├── Landing/          # Home page
    │   │   ├── Dashboard/        # User dashboard
    │   │   ├── ApplyJob/         # Job application
    │   │   ├── AppliedJobs/      # Applied jobs list
    │   │   ├── ResumeBuilder/    # Resume builder
    │   │   │   └── templates/    # 10 resume templates
    │   │   │       ├── Template1.jsx - Template10.jsx
    │   │   ├── ATSChecker/       # ATS score checker
    │   │   ├── Messages/         # Messaging interface
    │   │   └── MyProfile/        # User profile
    │   ├── config.js          # Frontend configuration
    │   └── other components
    ├── public/                # Static Files
    │   ├── hero/
    │   ├── Home/
    │   ├── logoicon/
    │   ├── testimonials/
    │   ├── manifest.json
    │   ├── robots.txt
    │   └── sitemap.xml
    ├── vite.config.mjs        # Vite configuration
    ├── firebase.json          # Firebase deployment config
    ├── package.json           # npm dependencies
    ├── jsconfig.json
    ├── tsconfig.node.json
    └── index.html             # Main entry point
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) + Google OAuth
- **Real-time**: Socket.io
- **AI Services**: 
  - Google Gemini API
  - OpenAI API
  - Custom AI analysis
- **Email**: SMTP service integration
- **Payment**: Payment gateway integration
- **Video Generation**: Video creation utilities
- **Cron Jobs**: Automated schedulers (payments, incentives)

### Frontend
- **Framework**: React.js
- **Build Tool**: Vite
- **Styling**: CSS / CSS Modules
- **State Management**: React hooks & Context API
- **Deployment**: Firebase Hosting
- **Firebase**: Authentication, Hosting, Database

### Additional Services
- **Email Service**: Gmail SMTP or similar
- **Socket.io**: Real-time messaging & notifications
- **JWT**: Secure token-based authentication
- **Google OAuth**: Social login integration

## 🚀 Deployment

### Frontend (Firebase Hosting)
- Automatically deployed from main branch
- Configuration in `firebase.json`
- Automatic redirects configured (`_redirects`)

### Backend (Node.js Server)
- Runs on configurable port (default: 10000)
- MongoDB connection required
- Environment variables in `.env` or `env.txt`
- Multiple server versions available:
  - `server.js` - Full version with all features
  - `server-fixed.js` - Production-tested version
  - `server-minimal.js` - Minimal version for testing

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Encryption** - Bcrypt hashing
- **Admin Role-Based Access** - adminAuth middleware
- **Feature Access Control** - featureAccess middleware
- **CORS Protection** - Cross-origin request handling
- **Payment Verification** - Secure payment processing
- **Rate Limiting** - API request throttling
- **Input Validation** - Request validation

## 📊 Database Models

**User Management:**
- `User` - User accounts and profiles
- `PendingRegistration` - Registration queue

**Job & Applications:**
- `Job` - Job listings
- `Application` - Job applications
- `AutoShortlist` - AI-powered shortlisting

**Learning & Assessment:**
- `Interview` - Interview records
- `CodingTest` - Coding assessments
- `AIAnalysis` - AI analysis results
- `CareerGuidance` - Career recommendations

**Communication:**
- `Message` - Direct messaging
- `ChatHistory` - Chat logs
- `Notification` - User notifications

**Transactions:**
- `Payment` - Payment records
- `Invoice` - Invoice generation
- `Incentive` - Referral incentives

**Other:**
- `Subscriber` - Newsletter subscribers
- `SiteStatistics` - Platform metrics

## ⚙️ Environment Variables

Create `.env` file or configure `env.txt` in `/backend` directory:

```env
# Server Configuration
NODE_ENV=production
PORT=10000

# Database
MONGO_URI=mongodb://username:password@host:port/internshell
MONGO_DB_NAME=internshell

# JWT & Security
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# CORS & API
CORS_ORIGIN=https://your-frontend-url.com
API_URL=https://your-api-url.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:10000/api/auth/google/callback

# AI Services
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@internshell.com

# Payment Gateway
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-public-key
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Firebase
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
FIREBASE_PROJECT_ID=your-firebase-project-id

# AWS (for file uploads, optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_BUCKET_NAME=your-s3-bucket

# Other Services
SOCKET_IO_ORIGIN=https://your-frontend-url.com
LOG_LEVEL=info
```

## 📝 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /google/callback` - Google OAuth login
- `GET /verify` - Verify JWT token
- `POST /refresh-token` - Refresh JWT token
- `POST /logout` - User logout

### Job Routes (`/api/jobs`)
- `GET /` - Get all jobs
- `GET /:id` - Get job details
- `POST /` - Create job (Admin/Recruiter)
- `PUT /:id` - Update job
- `DELETE /:id` - Delete job
- `GET /search` - Search jobs

### Application Routes (`/api/applications`)
- `GET /` - Get user applications
- `GET /:id` - Get application details
- `POST /` - Submit job application
- `PUT /:id` - Update application status
- `DELETE /:id` - Delete application

### Resume/Profile Routes (`/api/profile`)
- `GET /` - Get user profile
- `PUT /` - Update profile
- `GET /resume` - Get resume
- `POST /resume` - Save resume
- `DELETE /resume/:id` - Delete resume

### ATS Checker Routes (`/api/ats`)
- `POST /check` - Check ATS score
- `GET /history` - Get ATS check history
- `GET /report/:id` - Get ATS report

### AI Interview Routes (`/api/ai-interview`)
- `POST /start` - Start interview
- `POST /answer` - Submit interview answer
- `GET /results/:id` - Get interview results
- `GET /history` - Interview history

### AI Analysis Routes (`/api/ai-analysis`)
- `POST /analyze` - Analyze resume/profile
- `GET /results` - Get analysis results
- `POST /suggestion` - Get AI suggestions

### Coding Test Routes (`/api/coding-test`)
- `GET /` - Get available tests
- `POST /start` - Start test
- `POST /submit` - Submit solution
- `GET /results/:id` - Get test results

### Messaging Routes (`/api/messages`)
- `GET /` - Get conversations
- `POST /` - Send message
- `GET /:conversationId` - Get conversation messages
- `PUT /:id/read` - Mark as read
- `DELETE /:id` - Delete message

### Payment Routes (`/api/payment`)
- `POST /subscribe` - Subscribe to plan
- `GET /subscription` - Get subscription status
- `POST /verify` - Verify payment
- `GET /invoice` - Get invoices

### Dashboard Routes (`/api/dashboard`)
- `GET /stats` - Get user statistics
- `GET /applications` - Application overview
- `GET /recommendations` - Job recommendations

### Career Guidance Routes (`/api/career-guidance`)
- `GET /` - Get guidance suggestions
- `POST /ask` - Ask career question
- `GET /paths` - Get career paths

### Admin Routes (`/api/admin`)
- `GET /users` - List all users
- `GET /jobs` - Manage jobs
- `GET /applications` - Manage applications
- `GET /payments` - Payment management
- `GET /statistics` - Site statistics
- `PUT /settings` - Update settings

### Notification Routes (`/api/notifications`)
- `GET /` - Get notifications
- `PUT /:id/read` - Mark as read
- `DELETE /:id` - Delete notification

## 🏃 Getting Started

### Prerequisites
- Node.js 14+ and npm/yarn
- MongoDB 4.4+
- Git
- Modern web browser

### Backend Setup

1. **Clone and navigate to backend:**
```bash
cd backend
npm install
```

2. **Configure environment:**
Create or update `env.txt` with required variables (see Environment Variables section)

3. **Start server:**
```bash
# Development with nodemon
npm run dev

# Production
npm run start

# Using specific server version
node server-fixed.js
```

The server will run on configured PORT (default: 10000)

### Frontend Setup

1. **Navigate to frontend:**
```bash
cd frontend
npm install
```

2. **Development server:**
```bash
npm run dev
```

3. **Production build:**
```bash
npm run build
```

4. **Deploy to Firebase:**
```bash
firebase login
firebase deploy
```

## 🔍 Debugging & Testing

### Debug Mode
- Check `utils/emailService-debug.js` for email debugging
- Use `server-minimal.js` for testing specific features
- Enable logging in utils services

### Testing Workflow
1. Start backend: `node server.js`
2. Start frontend: `npm run dev` (from frontend folder)
3. Open http://localhost:5173 (or configured port)
4. Test features and check console logs

### Common Issues & Solutions

**MongoDB Connection Error:**
- Verify MONGO_URI in env.txt
- Check MongoDB service is running
- Ensure network access in MongoDB Atlas

**Email Not Sending:**
- Check EMAIL_USER and EMAIL_PASS
- Enable "Less secure apps" for Gmail
- Verify SMTP settings

**AI API Errors:**
- Verify API keys are correct
- Check API quotas in respective dashboards
- Review API service status

**CORS Issues:**
- Update CORS_ORIGIN with correct frontend URL
- Check frontend baseURL matches backend

## 📱 Frontend Pages Overview

### Intern/Jobseeker Views
1. **Landing Page** - Homepage with job listings and features
2. **Dashboard** - Personal dashboard with stats and recommendations
3. **Apply Job** - Job application form
4. **Applied Jobs** - View all applied job applications
5. **Resume Builder** - Create/edit resume with 10 templates
6. **ATS Checker** - Check resume ATS compatibility score
7. **Messages** - Chat with employers and recruiters
8. **My Profile** - User profile management

### Admin/Recruiter Views
- Admin Dashboard
- Job Management
- Application Tracking
- Payment Management
- Site Statistics
- User Management

## 🤖 AI Features Explained

### AI Interview Preparation
- Practice interviews with AI
- Real-time feedback
- Interview score tracking
- Question-wise analysis

### ATS Checker
- Resume analysis against job description
- Keyword matching
- Score improvement suggestions
- Template recommendations

### Job Recommendation Engine
- AI-powered job matching
- User profile analysis
- Skill-based recommendations
- Match percentage display

### Career Guidance
- AI career counseling
- Path recommendations
- Skill gap analysis
- Learning suggestions

## 💳 Payment Integration

### Supported Gateways
- Stripe
- Razorpay
- Custom payment gateway

### Payment Features
- Subscription plans
- One-time payments
- Invoice generation
- Payment history

## 📧 Email Notifications

Automated emails for:
- Account activation
- Password reset
- Job application status
- Interview invitations
- Payment confirmations
- Newsletter updates

## 🔐 User Roles & Permissions

### Roles
1. **Student/Jobseeker** - Job applicants
2. **Recruiter** - Job posters
3. **Admin** - Platform management
4. **Subscriber** - Premium features

### Permission Levels
- Public - No authentication required
- User - Authenticated users only
- Recruiter - Recruiter/Admin only
- Admin - Admin only

## 📊 Analytics & Reporting

### Dashboard Analytics
- Application statistics
- Interview performance
- Skill assessments
- Job search history

### Admin Analytics
- User growth
- Application trends
- Payment revenue
- Platform usage metrics

## 🚨 Troubleshooting

### Logs & Debugging
- Backend logs: Check console output
- Frontend logs: Browser DevTools console
- Server logs: Check `*.log` files if enabled
- Database logs: MongoDB connection logs

---

## 🛠️ Development Workflow & Guidelines

### Project Structure Best Practices

**Backend:**
- `controllers/` - Business logic for each feature (18+ controllers)
- `models/` - MongoDB schemas (15+ models)
- `routes/` - API endpoint definitions (20+ route files)
- `middleware/` - Auth, validation, feature access control
- `utils/` - Reusable services (email, AI, payment, etc.)
- `scheduler/` - Background cron jobs
- `config/` - Database and environment configuration
- `uploads/` - User uploaded files (messages, payments)

**Frontend:**
- `views/` - Page components (Landing, Dashboard, etc.)
- `components/` - Reusable UI components
- `services/` - API calls & business logic
- `store/` - Redux state management
- `layout/` - App layout wrapper
- `themes/` - Styling & theming
- `utils/` - Helper functions
- `hooks/` - Custom React hooks
- `config/` - Frontend configuration

### Development Workflow

**Step 1: Local Development Setup**
```bash
# Backend setup
cd backend
npm install
# Configure env.txt with local settings
npm run dev

# Frontend setup (in new terminal)
cd frontend
npm install
npm run dev
```

**Step 2: Feature Development**
1. Create feature branch: `git checkout -b feature/your-feature-name`
2. Implement backend:
   - Create/update model in `models/`
   - Create controller in `controllers/`
   - Add routes in `routes/`
3. Implement frontend:
   - Create page/component in `views/` or `components/`
   - Add service calls in `services/`
   - Update routing if needed
4. Test locally on http://localhost:5173

**Step 3: Testing & Validation**
- Test API endpoints with Postman or curl
- Test frontend features in browser
- Check browser console for errors
- Verify database changes in MongoDB

**Step 4: Git Workflow**
```bash
# Stage changes
git add .

# Commit with clear message
git commit -m "feat: add resume builder feature"

# Push to remote
git push origin feature/your-feature-name

# Create pull request for review
```

**Step 5: Deployment**
- Backend: Deploy to production server
- Frontend: Deploy to Firebase Hosting
- Verify environment variables in production
- Test critical workflows post-deployment

### Common Development Tasks

**Adding a New Feature:**
1. Identify required models/APIs
2. Create backend controller & routes
3. Create frontend pages/components
4. Test end-to-end
5. Add to documentation

**Adding a New API Endpoint:**
1. Identify the use case
2. Create/update relevant model
3. Create controller method
4. Add route in appropriate route file
5. Add authentication/authorization checks
6. Document endpoint in README API section

**Implementing AI Feature:**
1. Use `geminiService.js` for Google Gemini API
2. Use `openaiService.js` for OpenAI API
3. Call from controller
4. Store results in appropriate model
5. Return formatted response to frontend

**Integrating New Service:**
1. Add API key to environment variables
2. Create service file in `utils/`
3. Implement service methods
4. Call from appropriate controller
5. Add error handling

### Code Quality Standards

**Backend:**
- Use async/await for asynchronous operations
- Add try-catch for error handling
- Validate input data
- Use middleware for auth/validation
- Keep controllers clean (logic in utils if complex)
- Add comments for complex logic
- Use consistent error response format

**Frontend:**
- Use functional components with hooks
- Keep components small and reusable
- Use Redux for global state
- Add PropTypes validation
- Use Material-UI components for consistency
- Follow naming conventions (camelCase)
- Add loading/error states

### Environment Configuration

**Backend env.txt must have:**
- MONGODB_URI - Database connection
- JWT_SECRET - Token signing key
- CORS_ORIGIN - Frontend URL
- GEMINI_API_KEY - AI service key
- OPENAI_API_KEY - AI service key
- EMAIL_* - Email configuration
- RAZORPAY_* - Payment keys

**Frontend .env must have:**
- VITE_API_URL - Backend API URL
- VITE_FIREBASE_* - Firebase config
- VITE_GOOGLE_CLIENT_ID - OAuth client

### Security Checklist

- [ ] Validate all user inputs
- [ ] Use JWT for authentication
- [ ] Hash passwords with bcrypt
- [ ] Verify email before full access
- [ ] Implement rate limiting
- [ ] Use HTTPS in production
- [ ] Hide sensitive data from frontend
- [ ] Validate admin operations
- [ ] Log security events
- [ ] Regular security audits

### Performance Optimization

**Backend:**
- Use database indexes for frequently queried fields
- Implement pagination for large datasets
- Cache frequently accessed data
- Use compression middleware
- Optimize database queries
- Limit API response payload

**Frontend:**
- Code splitting with React.lazy()
- Image optimization & lazy loading
- Bundle size monitoring
- Remove unused dependencies
- Use production build for testing
- Implement request caching

### Testing Strategy

**Manual Testing:**
- Test happy path for each feature
- Test error scenarios
- Test edge cases
- Test on different browsers
- Test on different devices

**Automated Testing (Future):**
- Unit tests for utilities & services
- Integration tests for APIs
- E2E tests for critical workflows
- Setup Jest + React Testing Library

---

## 📚 Quick Reference

### Important Files & Their Purposes

**Backend Core:**
- `server.js` - Main server entry point
- `config/db.js` - MongoDB connection
- `utils/jwt.js` - JWT token handling
- `utils/emailService.js` - Email sending
- `utils/geminiService.js` - AI analysis
- `middleware/auth.js` - JWT verification
- `routes/authRoutes.js` - Authentication endpoints

**Frontend Core:**
- `index.jsx` - App entry point
- `routes/` - React Router configuration
- `services/` - API service calls
- `store/` - Redux store setup
- `config.js` - Frontend configuration

### Commonly Used Commands

**Backend:**
```bash
npm run dev              # Start development server with nodemon
npm run start            # Start production server
npm run scheduler        # Run incentive scheduler manually
```

**Frontend:**
```bash
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build locally
```

### Key API Endpoints by Feature

**Authentication:** `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`
**Jobs:** `/api/jobs/` GET, POST, PUT, DELETE
**Applications:** `/api/applications/` manage job applications
**Resume:** `/api/profile/resume` - upload & manage resume
**ATS:** `/api/ats/check` - check resume compatibility
**Messaging:** `/api/messages/` - real-time messaging
**Payment:** `/api/payment/subscribe` - subscription management
**Admin:** `/api/admin/*` - admin operations

### Database Models Quick Reference

**User-related:** User, PendingRegistration
**Job-related:** Job, Application, AutoShortlist
**Learning:** Interview, CodingTest, AIAnalysis, CareerGuidance
**Communication:** Message, ChatHistory, Notification
**Transaction:** Payment, Invoice, Incentive, Subscriber

### Debugging Tips

1. **Check Backend Console:** Look for error messages and stack traces
2. **Check Frontend Console:** Use browser DevTools (F12)
3. **Check Network Tab:** Verify API requests & responses
4. **Check MongoDB:** Query database directly using MongoDB Compass
5. **Check Logs:** Review any generated .log files
6. **Test with Postman:** Isolate API issues from frontend
7. **Use Debug Server:** `node server-minimal.js` for testing specific features

---

## 📊 Project Statistics

**Total Components:** 50+
**Total Controllers:** 18+
**Total Routes:** 20+
**Total Models:** 15+
**Lines of Code:** Backend: ~10,000+ | Frontend: ~8,000+
**API Endpoints:** 100+
**Database Collections:** 15+

---

## 🤝 Contributing Guidelines

1. **Pull Latest Changes**
   ```bash
   git pull origin main
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/description
   ```

3. **Make Changes & Commit**
   ```bash
   git commit -m "Clear commit message describing changes"
   ```

4. **Push & Create PR**
   ```bash
   git push origin feature/description
   ```

5. **Code Review & Merge**
   - Address review comments
   - Ensure tests pass
   - Merge to main branch

---

## 📞 Support & Contact

- **Email:** support@internshell.com
- **Documentation:** See this README
- **Issues:** Create GitHub issue
- **Discussion:** Start GitHub discussion

---

## 📄 License

ISC License - Feel free to use for learning and development

---

## ✅ Checklist for New Developers

- [ ] Clone repository
- [ ] Install dependencies (backend & frontend)
- [ ] Configure environment variables
- [ ] Start MongoDB
- [ ] Start backend server (`npm run dev`)
- [ ] Start frontend server (`npm run dev`)
- [ ] Test login with test account
- [ ] Browse featured jobs
- [ ] Read through this README completely
- [ ] Explore codebase structure
- [ ] Set up code editor (VS Code recommended)
- [ ] Install useful extensions (REST Client, MongoDB, etc.)

---

**Last Updated:** December 2024
**Version:** 1.0.0
**Status:** Active Development

For the latest workflow updates and features, always refer to this comprehensive README!