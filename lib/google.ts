import { google } from "googleapis";

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });
}

const drive = () => google.drive({ version: "v3", auth: getAuth() });
const sheets = () => google.sheets({ version: "v4", auth: getAuth() });

async function findOrCreateFolder(name: string, parentId: string): Promise<string> {
  const res = await drive().files.list({
    q: `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id)",
  });
  if (res.data.files?.length) return res.data.files[0].id!;

  const created = await drive().files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id",
  });
  return created.data.id!;
}

export async function uploadToDrive(
  pdfBuffer: Buffer,
  fileName: string,
  yearMonth: string,
  pagoSocio: boolean
): Promise<{ fileId: string; webViewLink: string }> {
  const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID!;
  const monthFolderId = await findOrCreateFolder(yearMonth, rootFolderId);
  const subFolder = pagoSocio ? "Pago pelo socio" : "Pago pela empresa";
  const subFolderId = await findOrCreateFolder(subFolder, monthFolderId);

  const file = await drive().files.create({
    requestBody: {
      name: fileName,
      parents: [subFolderId],
    },
    media: {
      mimeType: "application/pdf",
      body: Buffer.isBuffer(pdfBuffer)
        ? require("stream").Readable.from(pdfBuffer)
        : pdfBuffer,
    },
    fields: "id, webViewLink",
  });

  return {
    fileId: file.data.id!,
    webViewLink: file.data.webViewLink!,
  };
}

export async function appendToSheet(
  date: string,
  vendor: string,
  amount: string,
  pagoSocio: boolean,
  driveLink: string
) {
  await sheets().spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID!,
    range: "A:E",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[date, vendor, amount, pagoSocio ? "Sim" : "Nao", driveLink]],
    },
  });
}
