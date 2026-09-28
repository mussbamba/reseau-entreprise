// Lance l'application sur le réseau Wi-Fi local et affiche un QR code à scanner avec le téléphone.
// Usage : npm run telephone
import { spawn } from "node:child_process";
import { networkInterfaces } from "node:os";
import qrcode from "qrcode-terminal";

const PORT = process.env.PORT || "3000";
const ips = Object.values(networkInterfaces())
  .flat()
  .filter((i) => i && i.family === "IPv4" && !i.internal)
  .map((i) => i.address)
  // réseaux domestiques en priorité (192.168.x.x, 10.x.x.x)
  .sort((a, b) => Number(!a.startsWith("192.168.")) - Number(!b.startsWith("192.168.")));

if (!ips.length) {
  console.error("Aucune connexion réseau trouvée. Connectez l'ordinateur au Wi-Fi.");
  process.exit(1);
}

const ip = ips[0];
const url = `http://${ip}:${PORT}`;
console.log("\n📱 Sur votre iPhone (connecté au MÊME Wi-Fi que cet ordinateur) :");
console.log("   1. Scannez ce QR code avec l'appareil photo, ou tapez l'adresse dans Safari :");
console.log(`\n      ${url}\n`);
qrcode.generate(url, { small: true });
console.log("   2. Dans Safari : bouton Partager ⬆️  →  « Sur l'écran d'accueil »  →  Ajouter");
console.log("   3. Ouvrez « Saveurs » depuis l'écran d'accueil : l'app s'ouvre en plein écran.\n");
console.log(`   Admin : ${url}/admin     Démo 3D : ${url}/demo/index.html\n`);
if (ips.length > 1) console.log(`   (Autres adresses possibles : ${ips.slice(1).join(", ")})\n`);

const child = spawn("npx", ["next", "dev", "-H", "0.0.0.0", "-p", PORT], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, PHONE_HOST: ip },
});
child.on("exit", (code) => process.exit(code ?? 0));
