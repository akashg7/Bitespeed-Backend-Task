const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const connection = require("./src/config/db");
const { PrismaClient } = require("@prisma/client");
// const port = 3000;
const port = process.env.PORT || 3001;
const server = express();

server.use(cors());
server.use(bodyParser.json());
const prisma = new PrismaClient();
server.get("/", (req, res) => {
  return res.status(200).json({ message: "Hello Bitespeed" });
});

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

//identify endpoint
server.post("/identify", async (req, res) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res
      .status(400)
      .json({ message: "Either email or phoneNumber must be provided" });
  }

  if (email && !isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    const existingContacts = await prisma.contact.findMany({
      where: {
        OR: [
          email ? { email } : undefined,
          phoneNumber ? { phoneNumber } : undefined,
        ].filter(Boolean),
      },
      orderBy: { createdAt: "asc" },
    });
    // console.log(existingContacts);
    let primaryContact = null;
    let relatedContacts = [];
    let emails = [];
    let phoneNumbers = [];
    let linkedContactIds = [];

    if (existingContacts.length > 0) {
      const primaryContacts = existingContacts.filter(
        (contact) => contact.linkPrecedence === "primary"
      );
      // console.log(primaryContacts , "pcs")
      if (primaryContacts.length === 0){
        const secLinkedId = existingContacts[0].linkedId
        const realPrimary = await prisma.contact.findUnique({where : {id : secLinkedId}})
        const allContacts = await prisma.contact.findMany({where : {linkedId : realPrimary.id}})
        const Nemails = allContacts.map(contact=>contact.email)
        Nemails.push(realPrimary.email)
        Nemails.sort()
        const NphoneNumbers = allContacts.map(contact=>contact.phoneNumber)
        const NsecondaryContactIds = allContacts.map(contact=>contact.id)
        return res.status(200).json({
          contact: {
            primaryContactId: realPrimary.id,
            emails : Nemails,
            phoneNumbers : NphoneNumbers,
            secondaryContactIds: NsecondaryContactIds,
          },
        })
      }
      if (primaryContacts.length > 0) {
        primaryContacts.sort((a, b) => a.createdAt - b.createdAt); // sorting by the time created
        primaryContact = primaryContacts[0]; // old one becomes the primary

        // converting other primary contact to secondary and re-linking their secondaries
        if (primaryContacts.length > 1) {
          const otherPrimaryIds = primaryContacts
            .slice(1)
            .map((contact) => contact.id);

          await prisma.$transaction([
            prisma.contact.updateMany({
              //updaing the current primary contact to secondary contact
              where: { id: { in: otherPrimaryIds } },
              data: {
                linkedId: primaryContact.id,
                linkPrecedence: "secondary",
              },
            }),
            // edge case where im handling the contact which is going to be the secondary contact,
            // its secondary contacts now should point to the new primary contact
            prisma.contact.updateMany({
              where: { linkedId: { in: otherPrimaryIds } },
              data: { linkedId: primaryContact.id },
            }),
          ]);
        }
      } else {
        primaryContact = primaryContacts[0];
      }

      relatedContacts = await prisma.contact.findMany({
        where: {
          OR: [{ id: primaryContact.id }, { linkedId: primaryContact.id }],
        },
      });

      emails = [
        ...new Set(
          relatedContacts.map((contact) => contact.email).filter(Boolean)
        ),
      ];
      phoneNumbers = [
        ...new Set(
          relatedContacts.map((contact) => contact.phoneNumber).filter(Boolean)
        ),
      ];
      linkedContactIds = relatedContacts
        .filter((contact) => contact.id !== primaryContact.id)
        .map((contact) => contact.id);

      //creating the sec contact
      const isNewEmail = email && !emails.includes(email);
      const isNewPhoneNumber =
        phoneNumber && !phoneNumbers.includes(phoneNumber);

      if (isNewEmail || isNewPhoneNumber) {
        const newContact = await prisma.contact.create({
          data: {
            email: isNewEmail ? email : null,
            phoneNumber: isNewPhoneNumber ? phoneNumber : null,
            linkedId: primaryContact.id,
            linkPrecedence: "secondary",
          },
        });

        if (isNewEmail) emails.push(email);
        if (isNewPhoneNumber) phoneNumbers.push(phoneNumber);
        linkedContactIds.push(newContact.id);
      }
    } else {
      //here im creating the new contact
      primaryContact = await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkPrecedence: "primary",
        },
      });

      emails = email ? [email] : [];
      phoneNumbers = phoneNumber ? [phoneNumber] : [];
    }

    //returnig the res
    return res.status(200).json({
      contact: {
        primaryContactId: primaryContact.id,
        emails,
        phoneNumbers,
        secondaryContactIds: linkedContactIds,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

server.listen(port, () => {
  console.log(`server running on port ${port}`);
});
