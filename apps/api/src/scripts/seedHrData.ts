import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('Missing MONGODB_URI');

const client = new MongoClient(uri);

async function run() {
  await client.connect();
  const db = client.db('enginow');
  
  const hrAccount = await db.collection('staff_accounts').findOne({ role: 'hr' });
  if (!hrAccount) {
    console.log('No HR account found to attach data to.');
    await client.close();
    return;
  }
  const hrId = hrAccount._id.toString();
  const hrName = hrAccount.name;

  console.log('Seeding data for HR:', hrName, '(', hrId, ')');

  // 1. Careers (Jobs)
  const careers = [
    { title: 'Frontend Engineer (React)', domain: 'Frontend Engineering', locationType: 'Remote', type: 'Full-time', status: 'open', kind: 'job', salary: 'Competitive' },
    { title: 'Backend Engineer (Node.js)', domain: 'Backend Engineering', locationType: 'Onsite', type: 'Full-time', status: 'open', kind: 'job', salary: '12LPA' },
    { title: 'Content Writer — Engineering Blogs', domain: 'Content & Marketing', locationType: 'Hybrid', type: 'Contract', status: 'pending_approval', kind: 'job', salary: '6LPA' },
  ];

  await db.collection('careers').deleteMany({ authorId: hrId });

  const insertedCareers = await db.collection('careers').insertMany(
    careers.map(c => ({
      ...c,
      authorId: hrId,
      createdBy: hrName,
      company: 'Enginow',
      openFrom: new Date(Date.now() - 30 * 86400000),
      openUntil: c.status === 'closed' ? new Date(Date.now() - 86400000) : new Date(Date.now() + 30 * 86400000),
      createdAt: new Date(),
      updatedAt: new Date()
    }))
  );

  const careerIds = Object.values(insertedCareers.insertedIds);

  // 1.5 Internships
  const internships = [
    { title: 'Product Design Intern', domain: 'Design', locationType: 'Remote', type: 'Summer', status: 'open', kind: 'internship', stipend: '20k/mo', duration: '3 Months' },
    { title: 'Data Science Intern (Summer)', domain: 'Data Science', locationType: 'Onsite', type: 'Monsoon', status: 'closed', kind: 'internship', stipend: '25k/mo', duration: '2 Months' },
  ];

  await db.collection('internships').deleteMany({ authorId: hrId });

  const insertedInternships = await db.collection('internships').insertMany(
    internships.map(c => ({
      ...c,
      authorId: hrId,
      createdBy: hrName,
      company: 'Enginow',
      openFrom: new Date(Date.now() - 30 * 86400000),
      openUntil: c.status === 'closed' ? new Date(Date.now() - 86400000) : new Date(Date.now() + 30 * 86400000),
      createdAt: new Date(),
      updatedAt: new Date()
    }))
  );
  
  const internshipIds = Object.values(insertedInternships.insertedIds);

  // 2. Applications (Career)
  const careerApplications = [
    { careerId: careerIds[0], name: 'Aarav Sharma', stage: 'Applied' },
    { careerId: careerIds[0], name: 'Meera Kulkarni', stage: 'Shortlisted' },
    { careerId: careerIds[0], name: 'Nikhil Patel', stage: 'OA' },
    { careerId: careerIds[0], name: 'Pooja Iyer', stage: 'Selected' },
    { careerId: careerIds[0], name: 'Aarav Gupta', stage: 'Applied' },
    { careerId: careerIds[1], name: 'Meera Reddy', stage: 'Shortlisted' },
    { careerId: careerIds[1], name: 'Nikhil Verma', stage: 'OA' },
    { careerId: careerIds[1], name: 'Pooja Menon', stage: 'Applied' },
    { careerId: careerIds[1], name: 'Aarav Bose', stage: 'Selected' },
    { careerId: careerIds[1], name: 'Meera Nair', stage: 'Applied' },
  ];

  await db.collection('career_applications').deleteMany({ name: { $in: careerApplications.map(a => a.name) } });

  await db.collection('career_applications').insertMany(
    careerApplications.map(a => ({
      ...a,
      userId: new ObjectId().toString(),
      email: a.name.split(' ')[0].toLowerCase() + '@example.com',
      appliedAt: new Date(),
      updatedAt: new Date(),
      history: [{ stage: 'Applied', at: new Date(Date.now() - 86400000), by: a.name }]
    }))
  );

  // 2.5 Applications (Internship)
  const internshipApplications = [
    { internshipId: internshipIds[0], name: 'Nikhil Kapoor', status: 'pending' },
    { internshipId: internshipIds[0], name: 'Pooja Desai', status: 'shortlisted' },
    { internshipId: internshipIds[0], name: 'Aarav Singh', status: 'oa' },
    { internshipId: internshipIds[1], name: 'Meera Joshi', status: 'selected' },
    { internshipId: internshipIds[1], name: 'Nikhil Rao', status: 'pending' },
    { internshipId: internshipIds[1], name: 'Pooja Bhat', status: 'pending' },
    { internshipId: internshipIds[1], name: 'Aarav Mehta', status: 'shortlisted' },
  ];

  await db.collection('internship_applications').deleteMany({ name: { $in: internshipApplications.map(a => a.name) } });

  await db.collection('internship_applications').insertMany(
    internshipApplications.map(a => ({
      ...a,
      userId: new ObjectId().toString(),
      email: a.name.split(' ')[0].toLowerCase() + '@example.com',
      appliedAt: new Date(),
      updatedAt: new Date(),
    }))
  );

  // 3. Internship Seasons
  const seasons = [
    { name: 'Summer', startsText: '1st week of May', applicationsOpen: true, domains: ['Frontend Engineering', 'Data Science', 'Design'] },
    { name: 'Monsoon', startsText: '1st week of July', applicationsOpen: false, domains: ['Backend Engineering', 'Operations'] },
    { name: 'Spring', startsText: '1st week of February', applicationsOpen: true, domains: ['Frontend Engineering', 'Content & Marketing'] },
    { name: 'Winter', startsText: '1st week of December', applicationsOpen: false, domains: ['Content & Marketing', 'Design'] }
  ];
  
  await db.collection('internship_seasons').deleteMany({});
  await db.collection('internship_seasons').insertMany(seasons.map(s => ({ ...s, createdAt: new Date() })));

  // 4. Assessments
  const assessments = [
    { title: 'Frontend Screening — React & JS', listingId: careerIds[0].toString(), listingType: 'job', status: 'Live', durationMins: 60, domain: 'Frontend Engineering' },
    { title: 'Backend Online Assessment', listingId: careerIds[1].toString(), listingType: 'job', status: 'Live', durationMins: 90, domain: 'Backend Engineering' },
    { title: 'Design Intern Portfolio Task', listingId: internshipIds[0].toString(), listingType: 'internship', status: 'Draft', durationMins: 120, domain: 'Design' },
    { title: 'Data Science Aptitude', listingId: internshipIds[1].toString(), listingType: 'internship', status: 'Closed', durationMins: 45, domain: 'Data Science' },
  ];

  await db.collection('assessments').deleteMany({ createdBy: hrId });
  await db.collection('assessments').insertMany(assessments.map(a => ({ ...a, createdBy: hrId, createdAt: new Date() })));

  // 5. Blogs
  const blogs = [
    { title: 'What we look for in an Enginow intern', status: 'Published' },
    { title: 'Hiring pipeline, explained for candidates', status: 'pending_approval' },
    { title: 'Summer internship season is open', status: 'draft' },
    { title: '5 resume mistakes we see every season', status: 'rejected', rejectionReason: 'Please remove the screenshots of real candidate resumes.' },
  ];

  await db.collection('blogs').deleteMany({ authorId: hrId });
  await db.collection('blogs').insertMany(blogs.map(b => ({ ...b, authorId: hrId, createdBy: hrName, createdAt: new Date(), updatedAt: new Date() })));

  // 6. Contact Inquiries
  const inquiries = [
    { name: 'Rahul Sharma', email: 'rahul@example.com', category: 'career', message: 'I am interested in frontend positions.', status: 'new' },
    { name: 'Sneha Patel', email: 'sneha@example.com', category: 'career', message: 'Any upcoming design internships?', status: 'reviewed' },
    { name: 'Amit Kumar', email: 'amit@example.com', category: 'career', message: 'Issue with OA submission.', status: 'resolved' },
  ];

  await db.collection('inquiries').deleteMany({ category: 'career' });
  await db.collection('inquiries').insertMany(inquiries.map(i => ({ ...i, createdAt: new Date() })));

  // 7. Update HR Profile settings
  await db.collection('staff_accounts').updateOne(
    { _id: hrAccount._id },
    { 
      $set: { 
        settings: {
          notifyNewApplicant: true,
          notifyApproval: true,
          notifyInquiry: false
        }
      } 
    }
  );

  console.log('Seeding complete.');
  await client.close();
}

run().catch(console.error);
