import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load environment variables manually from .env if present
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
} catch (e) {
  // Ignore env loading errors
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey || supabaseServiceRoleKey.startsWith("PASTE_YOUR_NEW_")) {
  const missing = [
    ...(!supabaseUrl ? ["SUPABASE_URL"] : []),
    ...(!supabaseServiceRoleKey || supabaseServiceRoleKey.startsWith("PASTE_YOUR_NEW_") ? ["SUPABASE_SERVICE_ROLE_KEY"] : []),
  ];
  console.error(`\n❌ Error: Missing or unconfigured environment variable(s): ${missing.join(", ")}`);
  console.error("Please open your local '.env' file and configure the new project API credentials.");
  console.error("\n💡 How to find them:");
  console.error("1. Open your Supabase Project Dashboard (https://supabase.com/dashboard)");
  console.error("2. Go to Project Settings (gear icon) -> API");
  console.error("3. Under 'Project API Keys', copy the 'service_role' (secret) key and paste it as 'SUPABASE_SERVICE_ROLE_KEY'.");
  console.error("4. Also copy the 'anon' (public) key and paste it as 'SUPABASE_PUBLISHABLE_KEY' / 'VITE_SUPABASE_PUBLISHABLE_KEY'.\n");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function seed() {
  console.log("Starting Supabase database seeding for MP Magdy Bayoumi...");

  // Create bucket if it doesn't exist
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) throw listError;
    if (!buckets?.some((b) => b.id === "request-attachments")) {
      console.log("Creating storage bucket 'request-attachments'...");
      const { error: bucketError } = await supabase.storage.createBucket("request-attachments", {
        public: false,
      });
      if (bucketError) console.error("Error creating bucket:", bucketError);
      else console.log("✓ Bucket 'request-attachments' created successfully");
    } else {
      console.log("✓ Bucket 'request-attachments' already exists");
    }
  } catch (err) {
    console.error("Error checking/creating storage bucket:", err);
  }

  // Clean up existing records to prevent duplication
  console.log("Cleaning up existing database records...");
  await supabase.from("parliament_info").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("statistics").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("timeline_events").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("gallery_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("initiatives").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("achievements").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // 1. Parliament Info
  const parliamentInfo = {
    name: "مجدي عبد الوهاب عبد اللطيف بيومي",
    title: "النائب مجدي بيومي",
    bio: "سياسي برلماني مصري بارز، يمتلك مسيرة تشريعية ورقابية ممتدة بدأت منذ دورة 2010 واستمرت في دورات 2015 و2020. يمثل محافظة جنوب سيناء في مجلس النواب بنظام القوائم عن حزب مستقبل وطن، حيث يتولى أيضاً منصب أمين عام الحزب بالمحافظة. يركز في عمله البرلماني على ملفات التنمية الشاملة في سيناء ودعم وتطوير قطاع السياحة والطيران المدني، والتواصل المستمر مع مشايخ وعواقل القبائل البدوية لتلبية احتياجات المواطنين.",
    office_address: "مدينة الطور، جنوب سيناء، مصر",
    phone: "+201006505050",
    email: "contact@magdybayoumi.org",
    working_hours: "السبت إلى الخميس: 9:00 صباحًا - 5:00 مساءً",
    social_media: {
      facebook: "https://www.facebook.com/magdybayoumimp",
      instagram: "https://www.instagram.com/magdybayoumi",
      twitter: "https://twitter.com/magdybayoumimp",
      youtube: "https://www.youtube.com/channel/magdybayoumi",
      whatsapp: "+201006505050",
      office: "مكتب النائب مجدي بيومي للتواصل البرلماني والمجتمعي - جنوب سيناء",
      district: "دائرة محافظة جنوب سيناء",
      governorate: "جنوب سيناء",
      committee: "لجنة السياحة والطيران المدني بمجلس النواب",
      party: "حزب مستقبل وطن",
      profile_image: "",
      cover_image: "",
      map_link: "https://maps.google.com/?q=El-Tor,+South+Sinai+Governorate",
      speech_video: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
  };

  const { error: infoError } = await supabase.from("parliament_info").upsert([parliamentInfo]);

  if (infoError) {
    console.error("Error seeding parliament_info:", infoError);
  } else {
    console.log("✓ Seeded parliament_info successfully");
  }

  // 2. Statistics
  const statistics = [
    {
      label: "أعوام الخدمة البرلمانية",
      value: "١٥",
      icon: "FileText",
      sort_order: 1,
    },
    {
      label: "المعاملات والطلبات المستلمة",
      value: "+١٨,٥٠٠",
      icon: "Activity",
      sort_order: 2,
    },
    {
      label: "المبادرات المجتمعية",
      value: "+٤٥",
      icon: "CheckCircle",
      sort_order: 3,
    },
    {
      label: "اللقاءات الشعبية والقبلية",
      value: "+٣٢٠",
      icon: "Play",
      sort_order: 4,
    },
    {
      label: "المطالب والطلبات المعتمدة",
      value: "+١,٢٠٠",
      icon: "Trophy",
      sort_order: 5,
    },
  ];

  const { error: statsError } = await supabase.from("statistics").upsert(statistics);

  if (statsError) {
    console.error("Error seeding statistics:", statsError);
  } else {
    console.log("✓ Seeded statistics successfully");
  }

  // 3. Timeline Events
  const timelineEvents = [
    {
      year: "2010",
      title: "بداية العهد البرلماني",
      description:
        "الدخول لمجلس النواب المصري كعضو يمثل تطلعات المواطنين وبداية العمل على قضايا البنية التحتية والشباب.",
      sort_order: 1,
    },
    {
      year: "2015",
      title: "العضوية البرلمانية ولجنة السياحة",
      description:
        "انتخابه مجدداً لعضوية البرلمان والمشاركة الفعالة كعضو في لجنة السياحة والطيران المدني بالبرلمان.",
      sort_order: 2,
    },
    {
      year: "2017",
      title: "مؤتمر السياحة العلاجية",
      description:
        "المشاركة في مؤتمر السياحة العلاجية بشرم الشيخ وإطلاق حزمة توصيات لدعم المستثمرين وتطوير القطاع الخدمي.",
      sort_order: 3,
    },
    {
      year: "2020",
      title: "أمانة حزب مستقبل وطن بجنوب سيناء",
      description:
        "الفوز بعضوية البرلمان عن قائمة جنوب سيناء باسم حزب مستقبل وطن وتوليه أمانة الحزب لتعزيز التواصل المجتمعي.",
      sort_order: 4,
    },
    {
      year: "2022",
      title: "مؤتمر المناخ العالمي COP27",
      description:
        "دعم ومتابعة جهود تحويل مدينة شرم الشيخ إلى مدينة خضراء ذكية استعداداً لاستضافة مؤتمر المناخ العالمي.",
      sort_order: 5,
    },
    {
      year: "2026",
      title: "الخطة التسويقية الموحدة لسيناء",
      description:
        "تقديم خطة استراتيجية شاملة للنهوض بالسياحة في مجلس النواب واعتماد خطة تسويق عالمية موحدة لجنوب سيناء.",
      sort_order: 6,
    },
  ];

  const { error: timelineError } = await supabase.from("timeline_events").upsert(timelineEvents);

  if (timelineError) {
    console.error("Error seeding timeline_events:", timelineError);
  } else {
    console.log("✓ Seeded timeline_events successfully");
  }

  // 4. Initiatives
  const initiatives = [
    {
      title: "مبادرة التكفل بالحالات الإنسانية والأسر الأولى بالرعاية",
      slug: "humanitarian-cases-south-sinai",
      category: "مبادرات اجتماعية",
      description:
        "مبادرة شاملة للتكفل برعاية ودعم الأسر الأولى بالرعاية ومحدودي الدخل بمدينة طور سيناء ومناطق خليج السويس وخليج العقبة.",
      content:
        "أطلق النائب مجدي بيومي، أمين حزب مستقبل وطن بجنوب سيناء، مبادرة اجتماعية واسعة بالتعاون مع أمانات المدن لدعم الفئات الأكثر احتياجاً. تشمل المبادرة تقديم مساعدات عينية وغذائية شهرية، وتكفل الحزب بالحالات الإنسانية الحرجة والأيتام، وتوفير المستلزمات الأساسية للمعيشة. ويجري التنسيق للتوسع التدريجي في نطاق المساعدات ليشمل كافة التجمعات البدوية والقرى الجبلية في دهب ونويبع وسانت كاترين، تعزيزاً للتكافل الاجتماعي وترسيخاً لقيم التضامن الوطني.\n\n📍 الموقع: محافظة جنوب سيناء (الطور، خليج السويس، خليج العقبة)\n🔗 المصدر: abc-newsarabia.com (تاريخ النشر: 15 مارس 2024)",
      status: "نشط",
      date: "2024-03-15",
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1200",
      progress: 85,
    },
    {
      title: "المساندة الطبية وسداد اشتراكات التأمين الصحي الشامل",
      slug: "healthcare-insurance-support",
      category: "مبادرات صحية",
      description:
        "مبادرة لمساعدة المرضى غير القادرين، وتوفير مستلزمات طبية، وسداد اشتراكات التأمين الصحي الشامل للأسر الأولى بالرعاية.",
      content:
        "انطلاقاً من الحرص على توفير الرعاية الصحية الكريمة للمواطنين، قاد النائب مجدي بيومي مبادرة صحية كبرى لمساعدة مرضى الأورام والحالات الحرجة غير القادرين في جنوب سيناء. تضمنت المبادرة تقديم دعم مالي مباشر لتغطية نفقات العلاج، وتوفير أجهزة طبية خاصة للمرضى بالمنازل، بالإضافة إلى تحمل سداد اشتراكات مظلة التأمين الصحي الشامل للأسر المستحقة لضمان استمرار حصولهم على الخدمات الطبية والعلاجية المجانية دون انقطاع.\n\n📍 الموقع: جنوب سيناء\n🔗 المصدر: sada-elarab.com (تاريخ النشر: 10 مايو 2024)",
      status: "نشط",
      date: "2024-05-10",
      image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=1200",
      progress: 70,
    },
    {
      title: "لقاءات وبحث مطالب مشايخ وعواقل القبائل البدوية",
      slug: "bedouin-tribes-development",
      category: "مبادرات اجتماعية",
      description:
        "سلسلة لقاءات ميدانية مع مشايخ وعواقل قبائل جنوب سيناء لبحث وتلبية مطالب التجمعات البدوية والقرى والوديان.",
      content:
        "بتوجيهات من النائب مجدي بيومي، انطلقت لقاءات دورية موسعة في مدن دهب ورأس سدر ونويبع لتعزيز التواصل المباشر مع مشايخ وعواقل وأهالي القبائل البدوية. وتهدف المبادرة إلى رصد المطالب الخاصة بالتجمعات البدوية والوديان الجبلية، مثل توفير آبار المياه، وتعبيد المدقات الجبلية، وتحسين جودة خدمات التعليم والصحة والكهرباء، والعمل على رفع هذه الطلبات بشكل فوري للجهاز التنفيذي للمحافظة والوزارات المعنية لمتابعة تنفيذها وتذليل أي عقبات أمام قاطني هذه المناطق.\n\n📍 الموقع: مدن جنوب سيناء (دهب، رأس سدر، نويبع)\n🔗 المصدر: elwatannews.com (تاريخ النشر: 20 يناير 2025)",
      status: "نشط",
      date: "2025-01-20",
      image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=1200",
      progress: 90,
    },
    {
      title: "تأهيل وتمكين الشباب للعمل في القطاع السياحي",
      slug: "youth-tourism-training",
      category: "مبادرات تعليمية",
      description:
        "مبادرة لتأهيل وتدريب شباب جنوب سيناء على مهارات الضيافة والإرشاد السياحي للمنافسة في سوق العمل السياحي.",
      content:
        "تهدف هذه المبادرة إلى تمكين الكوادر الشبابية من أبناء المحافظة للاندماج في سوق العمل السياحي والفندقي. وتشمل المبادرة تنظيم دورات تدريبية متخصصة في مهارات اللغات الأجنبية، وأصول الضيافة الفندقية، والإرشاد السياحي البيئي بالتنسيق مع الفنادق والمنتجعات السياحية في شرم الشيخ ودهب. وتسعى المبادرة لربط مخرجات التدريب بفرص عمل حقيقية تسهم في خفض معدلات البطالة وتعزيز جودة الخدمات السياحية المقدمة للزوار الأجانب.\n\n📍 الموقع: شرم الشيخ ودهب\n🔗 المصدر: parlmany.com (تاريخ النشر: 18 فبراير 2026)",
      status: "مخطط له",
      date: "2026-02-18",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200",
      progress: 10,
    },
    {
      title: "القافلة الطبية المجانية لوديان سانت كاترين",
      slug: "st-catherine-medical-convoy",
      category: "مبادرات صحية",
      description:
        "تسيير قوافل طبية شاملة بالتعاون مع وزارة الصحة للكشف المجاني وتوزيع الأدوية على أهالي وديان سانت كاترين.",
      content:
        "أطلق النائب مجدي بيومي قافلة طبية مجانية شاملة بالتنسيق مع أمانة الحزب وجامعات طبية استهدفت وديان مدينة سانت كاترين النائية. وضمت القافلة تخصصات طبية متعددة (الباطنة، الأطفال، الرمد، الجراحة، العظام)، حيث قامت بإجراء الكشف الطبي المجاني على مئات المواطنين وتقديم العلاج والأدوية بالمجان، مع تحويل الحالات الحرجة التي تتطلب تدخلات جراحية إلى المستشفيات الكبرى بالقاهرة على نفقة الدولة.\n\n📍 الموقع: سانت كاترين (جنوب سيناء)\n🔗 المصدر: abc-newsarabia.com (تاريخ النشر: 5 نوفمبر 2025)",
      status: "مكتمل",
      date: "2025-11-05",
      image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=1200",
      progress: 100,
    },
  ];

  const { error: initiativesError } = await supabase
    .from("initiatives")
    .upsert(initiatives, { onConflict: "slug" });

  if (initiativesError) {
    console.error("Error seeding initiatives:", initiativesError);
  } else {
    console.log("✓ Seeded initiatives successfully");
  }

  // 5. Achievements
  const achievements = [
    {
      title: "اعتماد خطة تسويقية عالمية موحدة لجنوب سيناء",
      slug: "tourism-marketing-plan",
      category: "إنجازات تشريعية",
      description:
        "نجاح النائب في انتزاع موافقة حكومية لوضع خطة تسويقية دولية متكاملة لمدن جنوب سيناء لزيادة حركة التدفق السياحي.",
      content:
        "تحت قبة البرلمان وبالتنسيق مع لجنة السياحة والطيران المدني، نجح النائب مجدي بيومي في إقرار توصية برلمانية ملزمة للحكومة بوضع خطة تسويق عالمية موحدة وشاملة للمقاصد السياحية بجنوب سيناء (شرم الشيخ، دهب، نويبع، سانت كاترين). وتركز الخطة على إبراز التنوع السياحي الفريد للمحافظة (سياحة ترفيهية، علاجية، بيئية، ودينية) وعرضها في المعارض الدولية الكبرى لجذب أسواق سياحية جديدة وزيادة عوائد الاقتصاد القومي.\n\n🔗 المصدر: parlmany.com (تاريخ النشر: 12 أبريل 2026)",
      image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200",
      date: "2026-04-12",
      likes: 342,
      link: "https://parlmany.com",
    },
    {
      title: "تطوير البنية التحتية والمحاور المرورية بجنوب سيناء",
      slug: "infrastructure-roads",
      category: "خدمات وبنية تحتية",
      description:
        "المساهمة البرلمانية في اعتماد ميزانيات تطوير الطرق السريعة وربط مدن المحافظة بشبكة طرق حديثة وآمنة.",
      content:
        "ساهم النائب مجدي بيومي بفاعلية في تقديم طلبات إحاطة ومتابعة دورية لتسريع وتيرة مشروعات الطرق القومية بمحافظة جنوب سيناء. وقد توجت الجهود باعتماد واعمار شبكة الطرق الداخلية والفرعية التي تربط مدن خليج السويس بخليج العقبة، وتوسعة الطرق السريعة المؤدية لشرم الشيخ ودهب لرفع معدلات الأمان والحد من الحوادث وتسهيل انتقال المواطنين والسياح على حد سواء، مما دفع عجلة التنمية العمرانية بالمحافظة.\n\n🔗 المصدر: parlmany.com (تاريخ النشر: 30 سبتمبر 2024)",
      image: "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&q=80&w=1200",
      date: "2024-09-30",
      likes: 219,
      link: "https://parlmany.com",
    },
    {
      title: "إدراج ودعم مشروعات سانت كاترين التنموية (التجلي الأعظم)",
      slug: "great-transfiguration",
      category: "مشروعات قومية",
      description:
        "المتابعة والدعم البرلماني المستمر لتنفيذ مشروع 'التجلي الأعظم' التنموي والروحي بسانت كاترين لجذب السياحة البيئية والدينية.",
      content:
        "انطلاقاً من الأهمية الروحية والتاريخية لمدينة سانت كاترين، حرص النائب مجدي بيومي على تقديم الدعم البرلماني والرقابي الكامل لمشروع التطوير القومي الشامل 'التجلي الأعظم فوق أرض السلام'. وتابع النائب تنسيق الأعمال بين وزارات الإسكان والسياحة والبيئة لضمان تنفيذ المشروع وفقاً لأعلى المعايير البيئية العالمية التي تحافظ على المحمية الطبيعية وطابعها الأثري البديع، مما يفتح آفاقاً جديدة لسياحة التأمل والسياحة الروحانية بالمنطقة.\n\n🔗 المصدر: parlmany.com (تاريخ النشر: 14 مايو 2025)",
      image: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&q=80&w=1200",
      date: "2025-05-14",
      likes: 428,
      link: "https://parlmany.com",
    },
    {
      title: "إعفاء وتسهيل إجراءات التراخيص للمستثمرين السياحيين",
      slug: "tourism-investment",
      category: "اقتصاد واستثمار",
      description:
        "إقرار حزمة من التيسيرات وتمديد فترات سداد مديونيات المنشآت السياحية بجنوب سيناء لدعم قطاع الأعمال في مواجهة الأزمات.",
      content:
        "قاد النائب مجدي بيومي تحركات برلمانية واسعة بالتعاون مع غرف المنشآت السياحية والفندقية لمساندة المستثمرين الصغار والكبار في جنوب سيناء. وأثمرت هذه التحركات عن موافقة مجلس الوزراء على جدولة مديونيات الشركات والمنشآت السياحية المتعلقة بالكهرباء والمياه ورسوم التراخيص، مع تقديم تيسيرات استثنائية لتمكين الفنادق من استكمال مشروعات الصيانة والتطوير دون ضغوط مالية, لضمان استمرار دوران عجلة العمل السياحي والحفاظ على العمالة الوطنية.\n\n🔗 المصدر: parlmany.com (تاريخ النشر: 22 نوفمبر 2024)",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200",
      date: "2024-11-22",
      likes: 184,
      link: "https://parlmany.com",
    },
    {
      title: "رفع كفاءة الخدمات الصحية ومستشفيات جنوب سيناء",
      slug: "healthcare-upgrades",
      category: "خدمات وبنية تحتية",
      description:
        "نجاح مساعي النائب في توفير أجهزة طبية حديثة وأطقم رعاية متكاملة لمستشفيات طور سيناء وشرم الشيخ ودهب.",
      content:
        "استجابة لشكاوى المواطنين من أهالي جنوب سيناء، نجح النائب مجدي بيومي في استصدار قرارات وتوصيات من لجنة الصحة بالبرلمان لرفع كفاءة المنظومة العلاجية بمحافظة جنوب سيناء. شمل الإنجاز زيادة الدعم الموجه لمستشفى طور سيناء العام ومستشفى دهب المركزي، وتوفير أجهزة رنين مغناطيسي وأشعة مقطعية حديثة، وسد العجز في بعض التخصصات الطبية النادرة من خلال التعاقد مع أساتذة الجامعات، لتوفير رعاية صحية لائقة بأهالي المحافظة والزائرين.\n\n🔗 المصدر: sada-elarab.com (تاريخ النشر: 11 أغسطس 2025)",
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1200",
      date: "2025-08-11",
      likes: 275,
      link: "https://sada-elarab.com",
    },
  ];

  const { error: achievementsError } = await supabase
    .from("achievements")
    .upsert(achievements, { onConflict: "slug" });

  if (achievementsError) {
    console.error("Error seeding achievements:", achievementsError);
  } else {
    console.log("✓ Seeded achievements successfully");
  }

  // 6. Gallery Items
  const galleryItems = [
    {
      title: "لقاء النائب بمشايخ وعواقل جنوب سيناء - دهب",
      category: "لقاءات شعبية",
      image_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200",
      date: "2025-01-20",
    },
    {
      title: "مشاركة النائب في الجلسة العامة لمجلس النواب - القاهرة",
      category: "جلسات برلمانية",
      image_url: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=1200",
      date: "2026-04-12",
    },
    {
      title: "إطلاق قافلة المساعدات الغذائية والإنسانية - طور سيناء",
      category: "العمل الاجتماعي",
      image_url: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=1200",
      date: "2024-03-15",
    },
    {
      title: "أعمال القافلة الطبية المجانية - سانت كاترين",
      category: "مبادرات صحية",
      image_url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200",
      date: "2025-11-05",
    },
    {
      title: "تفقد أعمال رصف الطرق وتطوير المحاور - رأس سدر",
      category: "جولات ميدانية",
      image_url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=1200",
      date: "2024-09-30",
    },
  ];

  const { error: galleryError } = await supabase.from("gallery_items").upsert(galleryItems);

  if (galleryError) {
    console.error("Error seeding gallery_items:", galleryError);
  } else {
    console.log("✓ Seeded gallery_items successfully");
  }

  console.log("Supabase database seeding completed successfully!");
}

seed().catch((err) => {
  console.error("Fatal seeding error:", err);
  process.exit(1);
});
