import express from "express";
import nodemailer from "nodemailer";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(cors({ origin: "*" }));
app.use(express.json());

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

app.post("/enviar_email", upload.single("attachment"), async (req, res) => {
	const { to, subject, text, html } = req.body;
	const attachment = req.file;

	if (!to) {
		return res.status(400).json({ Erro: "O campo 'to' (destinatário) é obrigatório." });
	}

	const email = {
		from: process.env.EMAIL_USER,
		to,
		subject,
		text,
		html,
	};

	if (attachment) {
		email.attachments = [
			{
				filename: attachment.originalname,
				content: attachment.buffer, // Anexa o arquivo diretamente da memória
			},
		];
	}

	try {
		await transporter.sendMail(email);
		console.log({ Mensagem: "E-mail enviado com sucesso!" });
		res.status(200).json({ Mensagem: "E-mail enviado com sucesso!" });
	} catch (error) {
		console.log({ Erro: "Erro ao enviar o e-mail", details: error.message });
		res.status(500).json({ Erro: "Erro ao enviar o e-mail", details: error.message });
	}
});

app.get("/", (req, res) => {
	res.status(200).json({
		Mensagem: "Hello World!",
		Informações: "API Ligada, pronta para uso!",
	});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Servidor rodando na porta ${PORT}`);
});