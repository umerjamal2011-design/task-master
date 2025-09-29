# TaskFlow - Enhanced Task Management & Financial Tracking App

## Core Purpose & Success

**Mission Statement**: TaskFlow is a comprehensive productivity application that enables users to organize their work hierarchically and temporally, while managing their financial dealings with people - combining task management, daily scheduling, and personal finance tracking in one unified platform.

**Success Indicators**: 
- Users can efficiently break down complex projects into manageable sub-tasks
- Daily scheduling helps users maintain focus and structure throughout their day
- Hierarchical organization provides clarity on project dependencies and progress
- Time-based views help users manage both scheduled and flexible tasks
- Financial tracking provides transparency and organization for personal money dealings
- Users maintain clear records of loans, payments, and financial relationships

**Experience Qualities**: Organized, Comprehensive, Trustworthy

## Project Classification & Approach

**Complexity Level**: Complex Application - Advanced functionality with hierarchical data structures, temporal scheduling, financial tracking, and multiple view modes

**Primary User Activity**: Creating, Organizing, and Managing - Users actively create and manage complex task hierarchies with temporal constraints while tracking financial dealings with people

## Essential Features

### Hierarchical Task Structure
- **Unlimited sub-task nesting**: Users can create sub-tasks within sub-tasks to any depth level
- **Visual hierarchy indication**: Indentation and dot indicators show task depth and relationships
- **Expandable/collapsible views**: Users can focus on specific levels of detail
- **Dot system**: Visual dots on the left indicate subtask hierarchy levels (• for level 1, •• for level 2, etc.)
- **Cascade completion**: Option to mark parent tasks complete when all sub-tasks are done

### Advanced Scheduling System
- **Date scheduling**: Assign tasks to specific dates
- **Time scheduling**: Set specific times for focused work
- **Priority levels**: High, medium, and low priority indicators
- **Flexible vs. timed tasks**: Support both scheduled and "anytime" tasks

### Triple View System
- **Category View**: Traditional organization by project/category with hierarchical display
- **Daily View**: Time-focused view showing today's scheduled tasks, separated by timed and untimed
- **Financial View**: Comprehensive financial tracking with individual ledgers and transaction history
- **Date navigation**: Easy switching between different days

### Financial Management System
- **People Management**: Add and manage contacts with phone, email, and notes
- **Individual Ledgers**: Detailed financial history for each person showing all transactions
- **Transaction Types**: 
  - Loans Given (money you lent to others)
  - Payments Received (money others paid you back)
  - Loans Taken (money you borrowed from others)
  - Payments Made (money you paid back to others)
  - Other transactions for miscellaneous dealings
- **Balance Tracking**: Automatic calculation of who owes what to whom
- **Multi-Currency Support**: Handle transactions in different currencies
- **Transaction Categories**: Organize transactions by type (business, personal, etc.)
- **Financial Dashboard**: Overview of total amounts owed, amounts you owe, and net position
- **Search and Filter**: Quickly find people and transactions
- **Transaction History**: Chronological view of all financial activities

### Automated Prayer Time Integration
- **Location-based prayer times**: Automatically calculate prayer times based on IP location detection
- **Daily updates**: Prayer times refresh automatically every day with accurate timings
- **Location management**: Special prayer location selector allowing users to set custom location
- **Multiple calculation methods**: Support for different Islamic calculation methods (ISNA, Muslim World League, etc.)
- **Warning notifications**: Clear alerts that prayer times update automatically based on location
- **Automatic task creation**: Prayer times automatically generate daily tasks in the prayers category
- **Protected category**: Prayer category prevents manual task creation (times are generated automatically)

### Task Management Features
- **In-place editing**: Click to edit task titles and descriptions
- **Drag and drop**: (Future enhancement) Reorder tasks and change hierarchy
- **Quick task creation**: Streamlined process for adding both main tasks and sub-tasks
- **Rich task metadata**: Due dates, times, priorities, descriptions, and categories
- **Dark mode support**: Toggle between light and dark themes for all sections
- **Theme customization**: Category colors extend to all related UI elements for visual consistency

## Design Direction

### Visual Tone & Identity
- **Emotional Response**: Users should feel organized, in control, and financially transparent
- **Design Personality**: Clean, professional, trustworthy, and systematically organized
- **Visual Metaphors**: Hierarchical indentation for tasks, ledger-style for financial records, calendar-like daily views
- **Simplicity Spectrum**: Balanced interface - clean enough to avoid clutter, rich enough to show complex hierarchies and financial data

### Color Strategy
- **Color Scheme Type**: Adaptive monochromatic with strategic accents (supports both light and dark modes)
- **Primary Color**: Deep blue (#4F46E5) - represents focus and organization
- **Secondary Colors**: Adaptive grays that change based on theme for optimal contrast
- **Accent Color**: Warm orange (#F59E0B) - for completion states and highlights
- **Financial Colors**: 
  - Green for money owed to you (positive balance)
  - Red for money you owe (negative balance)  
  - Blue for neutral/settled balances
- **Color Psychology**: Blue promotes focus and productivity, green/red provide clear financial status, orange provides warmth and achievement satisfaction
- **Theme Flexibility**: Full dark mode support with carefully calibrated colors for comfortable use

### Typography System
- **Font Pairing Strategy**: Single font family (Inter) with varied weights for hierarchy
- **Typographic Hierarchy**: Clear distinction between task levels, categories, financial amounts, and metadata
- **Font Personality**: Clean, modern, highly legible for extended reading and number comprehension
- **Typography Consistency**: Consistent sizing and spacing creates visual rhythm across all sections

### Financial Interface Design
- **Currency Display**: Clear, properly formatted currency values with appropriate symbols
- **Balance Indicators**: Color-coded positive/negative balances with intuitive icons
- **Transaction Cards**: Organized display of transaction details with visual type indicators
- **Ledger Layout**: Traditional ledger-style organization for individual person views
- **Dashboard Metrics**: Key financial statistics displayed prominently
- **Trust Elements**: Clear data organization and transparency to build user confidence

### Visual Hierarchy & Layout
- **Attention Direction**: Primary tasks stand out, sub-tasks are visually nested, scheduled items have time indicators, financial balances are prominently displayed
- **White Space Philosophy**: Generous spacing prevents cognitive overload with complex hierarchies and financial data
- **Grid System**: Consistent alignment and spacing create order across all sections
- **Content Density**: Balanced - detailed enough to be useful, clean enough to reduce stress

### Component Design
- **Expandable Cards**: Task cards and financial transaction cards with smooth animations
- **Time Badges**: Clear visual indicators for scheduled times and dates
- **Priority Indicators**: Subtle color coding that doesn't overwhelm
- **Progress Indicators**: Visual completion rates and financial balance status
- **Nested Interaction**: Intuitive controls for creating and managing hierarchies
- **Financial Forms**: User-friendly transaction entry with smart defaults
- **Person Cards**: Contact-style cards showing financial relationship status
- **Theme Toggle**: Accessible dark/light mode switching in the header

### Animations & Interactions
- **Expand/Collapse**: Smooth animations for tasks and financial details
- **Progress Updates**: Satisfying completion animations for tasks and transactions
- **View Transitions**: Seamless switching between category, daily, and financial views
- **Micro-interactions**: Subtle hover states and button feedback across all sections

## Implementation Considerations

### Data Structure
- Tasks with optional `parentId` for hierarchical relationships
- People records with contact information and relationship metadata
- Transactions linked to people with type, amount, and temporal data
- Separate tracking of scheduled vs. unscheduled tasks
- Efficient filtering and sorting for daily views and financial summaries

### Performance
- Lazy loading for deeply nested hierarchies and large transaction histories
- Efficient re-rendering when task hierarchies or financial data changes
- Optimized date-based filtering and financial calculations
- Smart caching of financial summaries and balances

### User Experience
- Keyboard shortcuts for power users across all sections
- Progressive disclosure of advanced features
- Intuitive drag-and-drop (future enhancement)
- Mobile-responsive design for on-the-go management
- Data export capabilities for financial records

### Security & Privacy
- Local data storage with no external financial data transmission
- Clear data ownership and control
- Optional data backup and sync capabilities

## Technology Stack
- **Frontend**: React with TypeScript for type safety
- **State Management**: Custom hooks with persistent storage
- **UI Components**: Shadcn components for consistency
- **Styling**: Tailwind CSS for rapid, consistent styling
- **Animation**: Framer Motion for smooth transitions
- **Icons**: Phosphor Icons for clear, consistent iconography
- **Prayer Times API**: AlAdhan.com for accurate Islamic prayer timings
- **Location Services**: IPapi.co for IP-based location detection
- **Geocoding**: OpenStreetMap Nominatim for location search and reverse geocoding
- **Currency Formatting**: Native Intl.NumberFormat for proper currency display

## Success Metrics
- Task completion rates improve with hierarchical breakdown
- Users successfully schedule and complete daily tasks
- Financial transparency increases through regular transaction recording
- Users maintain better relationships through clear financial tracking
- Average session time indicates engaged, productive use
- User retention through improved organization, time management, and financial clarity