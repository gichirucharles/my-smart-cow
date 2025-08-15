# 🐄 Maziwa Smart - Dairy Farm Management System

A comprehensive dairy farm management application built with Next.js, Supabase, and TypeScript. Maziwa Smart helps dairy farmers track milk production, manage cattle, monitor health, handle finances, and optimize farm operations.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Configuration](#configuration)
- [Usage](#usage)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🐮 Cow Management
- **Cow Registration**: Add and manage individual cow records with detailed information
- **Calf Tracking**: Monitor calf birth, growth, and development
- **Breeding Records**: Track artificial insemination, pregnancy, and calving
- **Health Monitoring**: Record veterinary visits, vaccinations, and health status
- **Heat Detection**: Monitor and record estrus cycles

### 🥛 Milk Production
- **Daily Production**: Record morning and evening milk yields
- **Quality Tracking**: Monitor fat content, protein levels, and quality grades
- **Sales Management**: Track milk sales to different buyers
- **Pricing Management**: Set and manage milk pricing strategies
- **Collection Records**: Manage milk collection points and schedules

### 🌾 Feed Management
- **Inventory Tracking**: Monitor feed stock levels and purchases
- **Consumption Records**: Track daily feed consumption per cow
- **Nutritional Analysis**: Record feed nutritional information
- **Cost Analysis**: Calculate feed costs and efficiency ratios
- **Supplier Management**: Manage feed suppliers and purchase orders

### 💰 Financial Management
- **Expense Tracking**: Record and categorize all farm expenses
- **Income Management**: Track all sources of farm income
- **Budget Planning**: Create and monitor annual budgets
- **Profit Analysis**: Generate profit and loss reports
- **Payment History**: Maintain payment records and receipts

### 🏥 Health & Veterinary
- **Vet Visit Records**: Detailed veterinary visit documentation
- **Vaccination Schedules**: Track vaccination dates and schedules
- **Health Monitoring**: Daily health checks and body condition scoring
- **Treatment Records**: Medication and treatment documentation
- **Disease Management**: Track and manage disease outbreaks

### 📊 Reports & Analytics
- **Production Reports**: Milk production trends and analysis
- **Financial Reports**: Income, expenses, and profitability analysis
- **Health Reports**: Herd health status and veterinary summaries
- **Feed Reports**: Feed consumption and efficiency analysis
- **Custom Reports**: Generate custom reports based on specific criteria

### 👥 User Management
- **Multi-User Support**: Support for multiple farm workers
- **Role-Based Access**: Different access levels for different users
- **Admin Dashboard**: Comprehensive admin panel for system management
- **Subscription Management**: Flexible subscription plans and billing

## 🛠 Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern UI component library
- **Recharts**: Data visualization library
- **Lucide React**: Icon library

### Backend
- **Supabase**: Backend-as-a-Service platform
- **PostgreSQL**: Relational database
- **Row Level Security (RLS)**: Database-level security
- **Real-time Subscriptions**: Live data updates

### Authentication
- **Supabase Auth**: User authentication and authorization
- **JWT Tokens**: Secure token-based authentication
- **Email Verification**: Email-based account verification
- **Password Reset**: Secure password recovery

### Deployment
- **Vercel**: Frontend deployment platform
- **Supabase Cloud**: Database and backend hosting
- **GitHub Actions**: CI/CD pipeline
- **Custom Domain**: Production domain configuration

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **Supabase Account** for database and authentication
- **Vercel Account** (optional, for deployment)

## 🚀 Installation

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/your-username/maziwa-smart.git
cd maziwa-smart
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
# or
yarn install
\`\`\`

### 3. Environment Setup

Create a `.env.local` file in the root directory:

\`\`\`env
# Supabase Configuration
SUPABASE_NEXT_PUBLIC_SUPABASE_URL=your_supabase_proSUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Maziwa Smart

# Email Configuration (optional)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password

# Payment Configuration (optional)
PESAPAL_CONSUMER_KEY=your_pesapal_consumer_key
PESAPAL_CONSUMER_SECRET=your_pesapal_consumer_secret
\`\`\`

### 4. Database Setup

Run the database schema creation script in your Supabase SQL Editor:

\`\`\`sql
-- Copy and paste the contents of scripts/create-database-schema-v5.sql
-- This will create all necessary tables, indexes, and security policies
\`\`\`

### 5. Start Development Server

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

The application will be available at `http://localhost:3000`

## ⚙️ Configuration

### Database Configuration

Maziwa Smart uses a comprehensive database schema with 35+ tables covering all aspects of dairy farm management. The schema includes:

#### Core Tables
- `users` - User accounts and profiles
- `admin_users` - Administrative users
- `cows` - Individual cow records
- `calves` - Calf management
- `milk_production` - Daily milk production records

#### Management Tables
- `feed_inventory` - Feed stock management
- `feed_consumption` - Daily feed consumption
- `vet_visits` - Veterinary records
- `breeding_records` - Breeding and reproduction
- `expenses` - Financial expense tracking

#### System Tables
- `activity_logs` - User activity tracking
- `notifications` - System notifications
- `sync_status` - Data synchronization status
- `waitlist` - User waitlist management

### Authentication Configuration

The application supports multiple authentication methods:

1. **Email/Password**: Standard email and password authentication
2. **Email Verification**: Optional email verification for new accounts
3. **Password Reset**: Secure password recovery via email
4. **Admin Authentication**: Separate admin login system

### Subscription Configuration

Maziwa Smart includes a flexible subscription system:

- **Free Trial**: 30-day free trial for new users
- **Basic Plan**: Essential features for small farms
- **Premium Plan**: Advanced features for growing farms
- **Enterprise Plan**: Full features for large operations

## 🗄️ Database Setup

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Note your project URL and API keys

### 2. Run Database Schema

Execute the complete database schema in your Supabase SQL Editor:

\`\`\`sql
-- The schema includes:
-- - 35+ tables for comprehensive farm management
-- - Proper foreign key relationships
-- - Indexes for optimal performance
-- - Row Level Security (RLS) policies
-- - Triggers for data automation
-- - Initial data setup
\`\`\`

### 3. Configure Row Level Security

The schema automatically enables RLS policies that ensure:
- Users can only access their own data
- Admins have appropriate access levels
- Data integrity is maintained
- Security is enforced at the database level

### 4. Set Up Waitlist Automation

Run the waitlist automation script:

\`\`\`sql
-- This creates:
-- - Waitlist table for managing user signups
-- - Automatic admin notifications
-- - Approval workflows
-- - Email notification triggers
\`\`\`

## 📱 Usage

### Getting Started

1. **Sign Up**: Create a new account with your farm details
2. **Setup**: Complete the initial farm setup wizard
3. **Add Cows**: Register your cows with detailed information
4. **Record Production**: Start recording daily milk production
5. **Track Expenses**: Begin tracking farm expenses and income

### Daily Operations

#### Morning Routine
1. Record morning milk production for each cow
2. Update feed consumption records
3. Check cow health status
4. Review any notifications or alerts

#### Evening Routine
1. Record evening milk production
2. Update any health observations
3. Plan next day's activities
4. Review daily reports

### Monthly Tasks
1. Generate monthly production reports
2. Review financial performance
3. Update breeding records
4. Plan feed purchases
5. Schedule veterinary visits

### Annual Planning
1. Set annual production targets
2. Create annual budgets
3. Plan breeding programs
4. Review subscription needs
5. Generate tax reports

## 🏗️ Architecture

### Application Structure

\`\`\`
maziwa-smart/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── production/        # Milk production management
│   ├── cows/             # Cow management
│   ├── feeds/            # Feed management
│   ├── reports/          # Reports and analytics
│   └── settings/         # Application settings
├── components/           # Reusable React components
│   ├── ui/              # shadcn/ui components
│   ├── forms/           # Form components
│   ├── charts/          # Chart components
│   └── layout/          # Layout components
├── lib/                 # Utility libraries
│   ├── supabase.ts      # Supabase client configuration
│   ├── utils.ts         # General utilities
│   └── validation.ts    # Form validation schemas
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── scripts/             # Database scripts
└── public/              # Static assets
\`\`\`

### Data Flow

1. **User Input**: Forms capture user data with validation
2. **State Management**: React state and context manage application state
3. **API Layer**: Supabase client handles database operations
4. **Database**: PostgreSQL stores all application data
5. **Real-time Updates**: Supabase subscriptions provide live updates
6. **UI Updates**: React components re-render with new data

### Security Architecture

- **Authentication**: Supabase Auth handles user authentication
- **Authorization**: Row Level Security (RLS) enforces data access
- **Data Validation**: Client and server-side validation
- **Secure Communication**: HTTPS for all data transmission
- **Environment Variables**: Sensitive data stored securely

## 📚 API Documentation

### Authentication Endpoints

#### Sign Up
\`\`\`typescript
POST /auth/signup
{
  email: string
  password: string
  full_name: string
  phone_number?: string
  farm_name?: string
  location?: string
}
\`\`\`

#### Sign In
\`\`\`typescript
POST /auth/signin
{
  email: string
  password: string
}
\`\`\`

### Data Endpoints

#### Cows Management
\`\`\`typescript
GET /api/cows              # Get all cows
POST /api/cows             # Create new cow
PUT /api/cows/:id          # Update cow
DELETE /api/cows/:id       # Delete cow
\`\`\`

#### Milk Production
\`\`\`typescript
GET /api/production        # Get production records
POST /api/production       # Record new production
PUT /api/production/:id    # Update production record
\`\`\`

#### Feed Management
\`\`\`typescript
GET /api/feeds             # Get feed inventory
POST /api/feeds            # Add feed stock
PUT /api/feeds/:id         # Update feed record
\`\`\`

### Database Schema

The complete database schema includes:

#### Users and Authentication
- `users` - User profiles and settings
- `admin_users` - Administrative users
- `user_sessions` - Active user sessions

#### Farm Management
- `cows` - Individual cow records
- `calves` - Calf management
- `milk_production` - Production records
- `feed_inventory` - Feed stock
- `feed_consumption` - Consumption tracking

#### Health and Veterinary
- `vet_visits` - Veterinary records
- `health_monitoring` - Health checks
- `vaccinations` - Vaccination records
- `breeding_records` - Breeding data

#### Financial Management
- `expenses` - Expense tracking
- `income_records` - Income tracking
- `budget_planning` - Budget management
- `payment_history` - Payment records

## 🚀 Deployment

### Vercel Deployment

1. **Connect Repository**
   \`\`\`bash
   # Push to GitHub
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Configure environment variables
   - Deploy automatically on push

3. **Environment Variables**
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   \`\`\`

### Custom Domain Setup

1. **Add Domain in Vercel**
   - Go to your project settings
   - Add your custom domain
   - Configure DNS records

2. **SSL Certificate**
   - Vercel automatically provides SSL certificates
   - Ensure HTTPS is enforced

### Production Checklist

- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] RLS policies enabled
- [ ] Admin users created
- [ ] Email configuration tested
- [ ] Payment integration configured
- [ ] Monitoring and analytics set up
- [ ] Backup strategy implemented

## 🔧 Troubleshooting

### Common Issues

#### Chunk Loading Errors
**Problem**: "Loading chunk failed" errors
**Causes**:
1. Dynamic imports not properly handled
2. Heavy dependencies causing code splitting issues
3. Network connectivity problems
4. Build configuration issues

**Solutions**:
1. Remove dynamic imports of heavy libraries
2. Use static imports for critical components
3. Configure proper error boundaries
4. Implement retry mechanisms

#### Database Connection Issues
**Problem**: Cannot connect to Supabase
**Solutions**:
1. Verify environment variables
2. Check Supabase project status
3. Confirm API keys are correct
4. Test network connectivity

#### Authentication Problems
**Problem**: Users cannot sign in/up
**Solutions**:
1. Check Supabase Auth configuration
2. Verify email templates
3. Confirm RLS policies
4. Test with different browsers

#### Performance Issues
**Problem**: Slow page loads
**Solutions**:
1. Optimize database queries
2. Implement proper caching
3. Use pagination for large datasets
4. Optimize images and assets

### Debug Mode

Enable debug logging by setting:
\`\`\`env
NEXT_PUBLIC_DEBUG=true
\`\`\`

This will provide detailed console logs for:
- Authentication flows
- Database operations
- API requests
- Error tracking

### Support

For technical support:
- **Email**: support@maziwasmart.com
- **Documentation**: [docs.maziwasmart.com]
- **GitHub Issues**: [github.com/your-repo/issues]
- **Community Forum**: [community.maziwasmart.com]

## 🤝 Contributing

We welcome contributions to Maziwa Smart! Please follow these guidelines:

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Add documentation for new features

### Testing

\`\`\`bash
npm run test          # Run unit tests
npm run test:e2e      # Run end-to-end tests
npm run lint          # Check code quality
npm run type-check    # Verify TypeScript
\`\`\`

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for the excellent backend platform
- **Vercel** for seamless deployment
- **shadcn/ui** for beautiful UI components
- **Next.js** team for the amazing framework
- **Dairy farmers** who provided valuable feedback

## 📞 Contact

- **Website**: [maziwasmart.com]
- **Email**: info@maziwasmart.com
- **Twitter**: [@MaziwaSmart]
- **LinkedIn**: [Maziwa Smart]

---

**Maziwa Smart** - Empowering dairy farmers with smart technology 🐄✨
