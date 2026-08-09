import { seedStaffAccounts } from './apps/api/src/routes/staffAuth';
seedStaffAccounts().then(() => { console.log('Done'); process.exit(0); });
