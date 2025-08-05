const Inquiry = require("../model/inquiry");
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const postInquiry = async (req, res) => {
  try {
    const inquiryData = { ...req.body };
    const newInquiry = new Inquiry(inquiryData);
    const savedInquiry = await newInquiry.save();

    const logoImageUrl = "https://krenberry.com/api/logo/download/rndlogo.png";
    const logoStyle = "width: 100px; height: auto;";

    const emailHTML = `
<div style="font-family: Arial, sans-serif; background-color: #ffffff; padding: 40px 0;">
  <table align="center" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    
    <!-- Header with logo and title -->
    <tr>
      <td style="background-color: #ec2127; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 22px; margin: 10px 0 0;">Krenberry</h1>
      </td>
    </tr>

    <!-- Body content -->
    <tr>
      <td style="padding: 30px;">
        <h2 style="color: #ec2127; font-size: 20px; margin: 0 0 25px; text-align: center;">New Inquiry Received</h2>
        
        <p style="font-size: 16px; color: #333333; margin-bottom: 25px;">
          A new inquiry has been submitted through your website. Please find the details below:
        </p>

        <!-- Inquiry Details -->
        <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                <span style="font-weight: bold; color: #ec2127; font-size: 14px;">First Name:</span>
                <span style="color: #333333; font-size: 14px; margin-left: 10px;">${newInquiry.firstname}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                <span style="font-weight: bold; color: #ec2127; font-size: 14px;">Last Name:</span>
                <span style="color: #333333; font-size: 14px; margin-left: 10px;">${newInquiry.lastname}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                <span style="font-weight: bold; color: #ec2127; font-size: 14px;">Email:</span>
                <span style="color: #333333; font-size: 14px; margin-left: 10px;">${newInquiry.email}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                <span style="font-weight: bold; color: #ec2127; font-size: 14px;">Mobile No:</span>
                <span style="color: #333333; font-size: 14px; margin-left: 10px;">${newInquiry.mobileNo}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                <span style="font-weight: bold; color: #ec2127; font-size: 14px;">Company Size:</span>
                <span style="color: #333333; font-size: 14px; margin-left: 10px;">${newInquiry.companysize}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                <span style="font-weight: bold; color: #ec2127; font-size: 14px;">Active User:</span>
                <span style="color: #333333; font-size: 14px; margin-left: 10px;">${newInquiry.activeuser}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                <span style="font-weight: bold; color: #ec2127; font-size: 14px;">Topic:</span>
                <span style="color: #333333; font-size: 14px; margin-left: 10px;">${newInquiry.topic}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <span style="font-weight: bold; color: #ec2127; font-size: 14px;">Message:</span>
                <div style="color: #333333; font-size: 14px; margin-top: 8px; line-height: 1.5; background-color: #f9f9f9; padding: 10px; border-radius: 4px;">
                  ${newInquiry.message}
                </div>
              </td>
            </tr>
          </table>
        </div>
        <p style="font-size: 14px; color: #999999; text-align: center;">
          This is an automated email. Please do not reply to this message.
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #F7F4EE; padding: 20px 30px; text-align: center; font-size: 13px; color: #999999;">
        &copy; ${new Date().getFullYear()} Krenberry. All rights reserved.<br>
        New inquiry notification system
      </td>
    </tr>
  </table>
</div>
    `;

    const adminEmailOptions = {
      from: savedInquiry.email,
      to: process.env.EMAIL_USER,
      replyTo: savedInquiry.email,
      subject: 'New Inquiry Submitted',
      html: emailHTML
    };

    const userEmailOptions = {
      from: process.env.EMAIL_USER,
      to: savedInquiry.email,
      subject: 'Thank You for Your Inquiry',
      html: `
   <div style="font-family: Arial, sans-serif; background-color: #ffffff; padding: 40px 0;">
  <table align="center" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    
    <!-- Header with logo and title -->
    <tr>
      <td style="background-color: #ec2127; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 22px; margin: 10px 0 0;">Krenberry</h1>
      </td>
    </tr>

    <!-- Body content -->
    <tr>
      <td style="padding: 30px;">
        <h2 style="color: #ec2127; font-size: 20px; margin: 0 0 20px; text-align: center;">Thank You for Your Inquiry</h2>
        
        <p style="font-size: 16px; color: #333333;">Dear ${inquiryData.firstname || 'Valued Customer'},</p>
        
        <p style="font-size: 16px; color: #333333; line-height: 1.6;">
          Thank you for reaching out to <strong>Krenberry</strong>! We have received your inquiry and appreciate your interest in our services.
        </p>
        
        <p style="font-size: 16px; color: #333333; line-height: 1.6;">
          Our team will carefully review your message and get back to you within 24-48 hours. We're committed to providing you with the best possible assistance.
        </p>
        
        <p style="font-size: 16px; color: #333333; line-height: 1.6;">
          In the meantime, feel free to explore our website for more information about our products and services.
        </p>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://krenberry.com" style="background-color: #39B54A; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-size: 16px; display: inline-block;">
            Visit Our Website
          </a>
        </div>

        <p style="font-size: 16px; color: #333333; line-height: 1.6;">
          Best regards,<br>
          <strong>The Krenberry Team</strong>
        </p>

        <p style="font-size: 14px; color: #999999; text-align: center; margin-top: 30px;">
          This is an automated email. Please do not reply to this message.
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #F7F4EE; padding: 20px 30px; text-align: center; font-size: 13px; color: #999999;">
        &copy; ${new Date().getFullYear()} Krenberry. All rights reserved.<br>
        If you need immediate assistance, please contact us through our website.
      </td>
    </tr>
  </table>
</div>
      `,
    };

    await transporter.sendMail(adminEmailOptions);
    await transporter.sendMail(userEmailOptions);

    res.status(201).json({
      message: 'Inquiry created successfully and emails sent',
      data: savedInquiry,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create inquiry',
      error: error.message,
    });
  }
};


const getInquiries = async (req, res) => {
  try {
    const totalCount = await Inquiry.countDocuments();

    const countWithFields = await Inquiry.countDocuments({
      $or: [
        { utm_source: { $exists: true, $ne: '' } },
        { utm_medium: { $exists: true, $ne: '' } },
        { utm_campaign: { $exists: true, $ne: '' } },
        { utm_id: { $exists: true, $ne: '' } },
        { gclid: { $exists: true, $ne: '' } },
        { gcid_source: { $exists: true, $ne: '' } }
      ]
    });

    const countWithoutFields = await Inquiry.countDocuments({
      $nor: [
        { utm_source: { $exists: true, $ne: '' } },
        { utm_medium: { $exists: true, $ne: '' } },
        { utm_campaign: { $exists: true, $ne: '' } },
        { utm_id: { $exists: true, $ne: '' } },
        { gclid: { $exists: true, $ne: '' } },
        { gcid_source: { $exists: true, $ne: '' } }
      ]
    });

    const dataWithFields = await Inquiry.find({
      $or: [
        { utm_source: { $exists: true, $ne: '' } },
        { utm_medium: { $exists: true, $ne: '' } },
        { utm_campaign: { $exists: true, $ne: '' } },
        { utm_id: { $exists: true, $ne: '' } },
        { gclid: { $exists: true, $ne: '' } },
        { gcid_source: { $exists: true, $ne: '' } }
      ]
    });

    const dataWithoutFields = await Inquiry.find({
      $nor: [
        { utm_source: { $exists: true, $ne: '' } },
        { utm_medium: { $exists: true, $ne: '' } },
        { utm_campaign: { $exists: true, $ne: '' } },
        { utm_id: { $exists: true, $ne: '' } },
        { gclid: { $exists: true, $ne: '' } },
        { gcid_source: { $exists: true, $ne: '' } }
      ]
    });

    const inquiries = await Inquiry.find();

    res.status(200).json({
      totalCount,
      countWithFields,
      countWithoutFields,
      dataWithFields,
      dataWithoutFields,
      inquiries
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInquiriesById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.query.id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    res.status(200).json(inquiry);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve inquiry',
      error: error.message,
    });
  }
}

const UpdateInquirues = async (req, res) => {
  try {
    const updatedInquiry = await Inquiry.findByIdAndUpdate(
      req.query.id,
      { ...req.body },
      { new: true, runValidators: true } // Return the updated document
    );
    if (!updatedInquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    res.status(200).json({
      message: 'Inquiry updated successfully',
      data: updatedInquiry,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update inquiry',
      error: error.message,
    });
  }
}

const deleteInquiries = async (req, res) => {
  try {
    console.log(req.query.id)
    const deletedInquiry = await Inquiry.findByIdAndDelete(req.query.id);
    console.log("found inquiry", deletedInquiry)
    if (!deletedInquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    res.status(200).json({
      message: 'Inquiry deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete inquiry',
      error: error.message,
    });
  }
}

module.exports = { postInquiry, getInquiries, deleteInquiries, getInquiriesById, UpdateInquirues };
