import nodemailer from "nodemailer";

export async function sendApplicationEmail(applicationData: any, internshipData: any) {
  // If no SMTP credentials are provided, we just log a warning and skip
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP credentials not provided. Skipping application email delivery.");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const html = `
    <h2>New Internship Application</h2>
    <p><strong>Internship:</strong> ${internshipData.title} (${internshipData.type})</p>
    <p><strong>Applicant Name:</strong> ${applicationData.fullName}</p>
    <p><strong>Email:</strong> ${applicationData.email}</p>
    <p><strong>Phone:</strong> ${applicationData.phone}</p>
    <hr />
    <h3>Links</h3>
    <ul>
      <li><strong>LinkedIn:</strong> <a href="${applicationData.linkedin}">${applicationData.linkedin}</a></li>
      <li><strong>Github:</strong> ${applicationData.github ? `<a href="${applicationData.github}">${applicationData.github}</a>` : 'N/A'}</li>
      <li><strong>Resume:</strong> <a href="${applicationData.resumeUrl}">View Resume</a></li>
    </ul>
    <hr />
    <h3>Education & Experience</h3>
    <ul>
      <li><strong>Location:</strong> ${applicationData.cityState}</li>
      <li><strong>Experience:</strong> ${applicationData.experience}</li>
      <li><strong>Highest Education:</strong> ${applicationData.education}</li>
      <li><strong>College:</strong> ${applicationData.college}</li>
      <li><strong>Graduation Year:</strong> ${applicationData.graduationYear}</li>
      <li><strong>Current Semester:</strong> ${applicationData.semester || 'N/A'}</li>
      <li><strong>CGPA:</strong> ${applicationData.cgpa || 'N/A'}</li>
    </ul>
    <hr />
    <h3>Additional Info</h3>
    <p><strong>Skills:</strong> ${applicationData.skills}</p>
    <p><strong>Availability:</strong> ${applicationData.availability}</p>
    <p><strong>Cover Letter:</strong></p>
    <p>${applicationData.coverLetter ? applicationData.coverLetter.replace(/\n/g, '<br />') : 'N/A'}</p>
  `;

  await transporter.sendMail({
    from: `"Enginow Applications" <${process.env.SMTP_USER}>`,
    to: "p44693749@gmail.com",
    subject: `New Application: ${applicationData.fullName} for ${internshipData.title}`,
    html,
  });
}
