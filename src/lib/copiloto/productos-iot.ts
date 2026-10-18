/** Catálogo editorial: enlaces externos, sin precios ni existencias sincronizadas. */
import omron from "@/assets/omron-evolv.jpg.asset.json";
import minimed from "@/assets/minimed-780g.jpg.asset.json";
import atellica from "@/assets/atellica-solution.jpg.asset.json";
import vista from "@/assets/draeger-vista-120.jpg.asset.json";
import transtek from "@/assets/transtek-bluetooth-plus.jpg.asset.json";
import libre from "@/assets/abbott-libre-3-plus.jpg.asset.json";
import latitude from "@/assets/boston_scientific_latitude_communicator.jpg.asset.json";
import somatom from "@/assets/siemens_somatom_go.jpg.asset.json";
import impella from "@/assets/impella-connect.jpg.asset.json";

export const productosIoT = [
  {
    nombre: "OMRON Evolv", marca: "OMRON", proveedor: "Amazon", uso: "En casa",
    categoria: "Presión arterial", imagen: omron.url,
    descripcion: "Tensiómetro de brazo que registra presión arterial y pulso. Comparte mediciones por Bluetooth con OMRON connect.",
    enlace: "https://www.amazon.com/Omron-Bluetooth-Wireless-Pressure-Compatible/dp/B01MRL790Q",
    fuente: "https://omronhealthcare.com/products/evolv-wireless-upper-arm-blood-pressure-monitor-bp7000",
    accion: "Ver en Amazon", fotoFuente: "OMRON",
  },
  {
    nombre: "TeleRPM BPM Bluetooth Plus", marca: "Transtek", proveedor: "Alibaba", uso: "Seguimiento remoto",
    categoria: "Presión arterial", imagen: transtek.url,
    descripcion: "Tensiómetro Bluetooth para programas de seguimiento remoto. Consulte el modelo exacto y las condiciones de compra con el proveedor.",
    enlace: "https://transtek.en.alibaba.com/productgrouplist-819334019/RPM_Devices.html",
    fuente: "https://www.transtekcorp.com/products/telerpm-bpm-bluetooth-plus-bluetooth-blood-pressure-monitor/",
    accion: "Proveedor en Alibaba", fotoFuente: "Transtek",
    nota: "El enlace abre el catálogo del proveedor, no una oferta específica de este modelo.",
  },
  {
    nombre: "MiniMed 780G", marca: "Medtronic", proveedor: "Medtronic", uso: "Con indicación médica",
    categoria: "Glucosa e insulina", imagen: minimed.url,
    descripcion: "Sistema de administración automatizada de insulina que utiliza lecturas de un sensor de glucosa. Requiere valoración y acompañamiento profesional.",
    enlace: "https://www.medtronicdiabetes.com/products/minimed-780g-insulin-pump-system",
    fuente: "https://www.medtronic.com/en-us/healthcare-professionals/products/diabetes/insulin-pumps/minimed-780g-insulin-pump.html",
    accion: "Consultar fabricante", fotoFuente: "MiniMed / Medtronic",
  },
  {
    nombre: "Vista 120", marca: "Dräger", proveedor: "Dräger", uso: "Uso hospitalario",
    categoria: "Signos vitales", imagen: vista.url,
    descripcion: "Monitor multiparámetro para ECG, saturación de oxígeno, presión arterial y temperatura. Se conecta con sistemas y equipos Dräger compatibles.",
    enlace: "https://www.draeger.com/en_uk/Products/Vista-120",
    fuente: "https://www.draeger.com/en_uk/Products/Vista-120",
    accion: "Consultar fabricante", fotoFuente: "Biobilden · Dräger",
  },
  {
    nombre: "Atellica Solution", marca: "Siemens Healthineers", proveedor: "Siemens", uso: "Laboratorio profesional",
    categoria: "Análisis de laboratorio", imagen: atellica.url,
    descripcion: "Sistema de química clínica e inmunoensayo para laboratorios conectados. Analiza muestras; no es un dispositivo personal de monitorización continua.",
    enlace: "https://www.siemens-healthineers.com/laboratory-diagnostics/clinical-chemistry-and-immunoassay-systems/atellica-solution-analyzers",
    fuente: "https://www.siemens-healthineers.com/laboratory-diagnostics/clinical-chemistry-and-immunoassay-systems/atellica-solution-analyzers",
    accion: "Consultar fabricante", fotoFuente: "Siemens Healthineers",
  },
  {
    nombre: "FreeStyle Libre 3 Plus", marca: "Abbott", proveedor: "Abbott", uso: "Con indicación médica",
    categoria: "Glucosa continua", imagen: libre.url,
    descripcion: "Sensor de glucosa intersticial que envía lecturas a un teléfono compatible. Permite alarmas y compartir información con el equipo de atención mediante las aplicaciones del fabricante.",
    enlace: "https://www.freestyle.abbott/us-en/products/freestyle-libre-3.html",
    fuente: "https://www.freestyle.abbott/us-en/products/freestyle-libre-3.html",
    accion: "Consultar fabricante", fotoFuente: "Abbott",
  },
  {
    nombre: "LATITUDE NXT Communicator", marca: "Boston Scientific", proveedor: "Boston Scientific", uso: "Seguimiento remoto",
    categoria: "Dispositivos cardíacos", imagen: latitude.url,
    descripcion: "Comunicador que recoge datos de dispositivos cardíacos implantados compatibles y los transmite al equipo clínico. Requiere configuración por el centro de atención; no sustituye la atención de urgencias.",
    enlace: "https://www.bostonscientific.com/en-US/products/remote-patient-monitoring/latitude-nxt.html",
    fuente: "https://www.bostonscientific.com/en-US/products/remote-patient-monitoring/latitude-nxt.html",
    accion: "Consultar fabricante", fotoFuente: "Boston Scientific",
  },
  {
    nombre: "SOMATOM go. platform", marca: "Siemens Healthineers", proveedor: "Siemens", uso: "Radiología profesional",
    categoria: "Imagen médica conectada", imagen: somatom.url,
    descripcion: "Familia de tomógrafos con flujos digitales para adquirir y distribuir imágenes clínicas. Es equipamiento de radiología, no un sensor personal de variables fisiológicas.",
    enlace: "https://www.siemens-healthineers.com/en-us/computed-tomography/somatom/somatom-go-platform",
    fuente: "https://www.siemens-healthineers.com/en-us/computed-tomography/somatom/somatom-go-platform",
    accion: "Consultar fabricante", fotoFuente: "Siemens Healthineers",
  },
  {
    nombre: "Impella Connect", marca: "Abiomed · Johnson & Johnson", proveedor: "Johnson & Johnson", uso: "Uso hospitalario",
    categoria: "Asistencia cardíaca conectada", imagen: impella.url,
    descripcion: "Solución conectada que permite a profesionales consultar a distancia la pantalla del controlador Impella. No controla la bomba a distancia ni reemplaza sus alarmas o la vigilancia del paciente.",
    enlace: "https://www.abiomed.com/en-us/products-and-services/services/impella-connect",
    fuente: "https://www.abiomed.com/en-us/products-and-services/services/impella-connect",
    accion: "Consultar fabricante", fotoFuente: "Abiomed · Johnson & Johnson",
    nota: "La imagen muestra la visualización en un teléfono. No incluye un teléfono ni es un equipo de uso doméstico.",
  },
];
