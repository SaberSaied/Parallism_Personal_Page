import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateParliamentInfo } from "@/lib/content.functions";
import { parliamentInfoQuery } from "@/lib/queries";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MessageCircle,
  Save,
  Image as ImageIcon,
  Building2,
  Award,
  ExternalLink,
} from "lucide-react";

interface ParliamentInfoInput {
  id: string;
  name: string;
  title: string;
  bio: string;
  office_address: string;
  phone: string;
  email: string;
  working_hours: string;
  social_media: Record<string, string>;
}

export function SettingsAdmin() {
  const qc = useQueryClient();
  const q = useQuery(parliamentInfoQuery);
  const updateInfo = useServerFn(updateParliamentInfo);

  // Form states
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");
  const [workingHours, setWorkingHours] = useState("");

  // Social media and extra fields in JSON
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [party, setParty] = useState("");
  const [committee, setCommittee] = useState("");
  const [district, setDistrict] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [speechVideo, setSpeechVideo] = useState("");

  // Synchronize form states with query data
  useEffect(() => {
    if (q.data) {
      setName(q.data.name || "");
      setTitle(q.data.title || "");
      setBio(q.data.bio || "");
      setEmail(q.data.email || "");
      setPhone(q.data.phone || "");
      setOfficeAddress(q.data.office_address || "");
      setWorkingHours(q.data.working_hours || "");

      const social = (q.data.social_media as Record<string, string>) || {};
      setFacebook(social.facebook || "");
      setTwitter(social.twitter || "");
      setInstagram(social.instagram || "");
      setYoutube(social.youtube || "");
      setWhatsapp(social.whatsapp || "");
      setParty(social.party || "");
      setCommittee(social.committee || "");
      setDistrict(social.district || "");
      setProfileImage(social.profile_image || "");
      setCoverImage(social.cover_image || "");
      setMapLink(social.map_link || "");
      setSpeechVideo(social.speech_video || "");
    }
  }, [q.data]);

  const updateMut = useMutation({
    mutationFn: (data: ParliamentInfoInput) => updateInfo({ data }),
    onSuccess: () => {
      toast.success("تم حفظ إعدادات الملف الشخصي بنجاح");
      qc.invalidateQueries({ queryKey: ["parliament_info"] });
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : "حدث خطأ أثناء حفظ الإعدادات");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !title || !bio) {
      toast.error("يرجى ملء الحقول الأساسية: الاسم، المسمى، والسيرة");
      return;
    }

    const payload = {
      id: q.data?.id || "parliament-info-magdy-bayoumi",
      name,
      title,
      bio,
      office_address: officeAddress,
      phone,
      email,
      working_hours: workingHours,
      social_media: {
        facebook,
        twitter,
        instagram,
        youtube,
        whatsapp,
        party,
        committee,
        district,
        profile_image: profileImage,
        cover_image: coverImage,
        map_link: mapLink,
        speech_video: speechVideo,
      },
    };

    updateMut.mutate(payload);
  };

  if (q.isLoading) {
    return <div className="text-center py-12 text-navy-500">جارٍ تحميل الإعدادات...</div>;
  }

  const inputClass =
    "w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm text-navy-800 focus:border-gold-500 focus:outline-none transition-colors";
  const labelClass = "block text-xs font-bold text-navy-600 mb-1";
  const iconWrapper =
    "absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-navy-400";

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Settings Form */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Information Card */}
          <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="mb-4 text-base font-extrabold text-navy-800 flex items-center gap-2 border-b border-navy-50 pb-3">
              <User className="h-5 w-5 text-gold-500" />
              المعلومات الأساسية والبيوغرافية
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>الاسم الكامل للنائب</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  required
                  minLength={3}
                  maxLength={120}
                  pattern="^[a-zA-Z\u0600-\u06FF\s]+$"
                  title="الاسم يجب أن يحتوي على حروف فقط (العربية أو الإنجليزية)"
                />
              </div>

              <div>
                <label className={labelClass}>اللقب أو المسمى البرلماني</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: النائب مجدي بيومي"
                  className={inputClass}
                  required
                  minLength={3}
                  maxLength={100}
                />
              </div>

              <div>
                <label className={labelClass}>الحزب السياسي</label>
                <div className="relative">
                  <div className={iconWrapper}>
                    <Building2 className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={party}
                    onChange={(e) => setParty(e.target.value)}
                    className={`${inputClass} pr-9`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>اللجنة البرلمانية</label>
                <div className="relative">
                  <div className={iconWrapper}>
                    <Award className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={committee}
                    onChange={(e) => setCommittee(e.target.value)}
                    className={`${inputClass} pr-9`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>الدائرة البرلمانية (المحافظة والمنطقة)</label>
                <div className="relative">
                  <div className={iconWrapper}>
                    <MapPin className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className={`${inputClass} pr-9`}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>النبذة التعريفية (السيرة الذاتية)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className={inputClass}
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="mb-4 text-base font-extrabold text-navy-800 flex items-center gap-2 border-b border-navy-50 pb-3">
              <Mail className="h-5 w-5 text-gold-500" />
              معلومات الاتصال والعمل
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>البريد الإلكتروني الرسمي</label>
                <div className="relative">
                  <div className={iconWrapper}>
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${inputClass} pr-9 ltr`}
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>رقم الهاتف للتواصل</label>
                <div className="relative">
                  <div className={iconWrapper}>
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`${inputClass} pr-9 ltr`}
                    dir="ltr"
                    required
                    pattern="^\+?\d{8,15}$"
                    title="رقم الهاتف يجب أن يتكون من 8 إلى 15 رقماً وقد يبدأ بـ +"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>اسم/عنوان مقر المكتب</label>
                <div className="relative">
                  <div className={iconWrapper}>
                    <MapPin className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={officeAddress}
                    onChange={(e) => setOfficeAddress(e.target.value)}
                    placeholder="مثال: مدينة الطور، جنوب سيناء، مصر"
                    className={`${inputClass} pr-9`}
                    required
                    minLength={5}
                    maxLength={200}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>رابط موقع المكتب على الخريطة (Google Maps URL)</label>
                <div className="relative">
                  <div className={iconWrapper}>
                    <ExternalLink className="h-4 w-4" />
                  </div>
                  <input
                    type="url"
                    value={mapLink}
                    onChange={(e) => setMapLink(e.target.value)}
                    placeholder="https://maps.google.com/?q=..."
                    className={`${inputClass} pr-9 ltr`}
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>ساعات العمل الرسمية</label>
                <div className="relative">
                  <div className={iconWrapper}>
                    <Clock className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    className={`${inputClass} pr-9`}
                    required
                    minLength={3}
                    maxLength={100}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Links & Imagery Card */}
          <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="mb-4 text-base font-extrabold text-navy-800 flex items-center gap-2 border-b border-navy-50 pb-3">
              <MessageCircle className="h-5 w-5 text-gold-500" />
              روابط التواصل الاجتماعي والصور
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>رابط صفحة فيسبوك</label>
                <div className="relative">
                  <div className={iconWrapper}>
                    <Facebook className="h-4 w-4" />
                  </div>
                  <input
                    type="url"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="https://facebook.com/..."
                    className={`${inputClass} pr-9 ltr`}
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>رابط حساب تويتر (X)</label>
                <div className="relative">
                  <div className={iconWrapper}>
                    <Twitter className="h-4 w-4" />
                  </div>
                  <input
                    type="url"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="https://twitter.com/..."
                    className={`${inputClass} pr-9 ltr`}
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>رابط حساب إنستغرام</label>
                <div className="relative">
                  <div className={iconWrapper}>
                    <Instagram className="h-4 w-4" />
                  </div>
                  <input
                    type="url"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/..."
                    className={`${inputClass} pr-9 ltr`}
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>رابط قناة يوتيوب</label>
                <div className="relative">
                  <div className={iconWrapper}>
                    <Youtube className="h-4 w-4" />
                  </div>
                  <input
                    type="url"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className={`${inputClass} pr-9 ltr`}
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>رقم الهاتف للواتساب (WhatsApp)</label>
                <div className="relative">
                  <div className={iconWrapper}>
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="مثال: +201000000000"
                    className={`${inputClass} pr-9 ltr`}
                    dir="ltr"
                    pattern="^\+?\d{8,15}$"
                    title="رقم واتساب يجب أن يتكون من 8 إلى 15 رقماً وقد يبدأ بـ +"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>رابط الصورة الشخصية (Avatar)</label>
                <div className="relative">
                  <div className={iconWrapper}>
                    <ImageIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={profileImage}
                    onChange={(e) => setProfileImage(e.target.value)}
                    placeholder="/src/assets/avatar.jpg"
                    className={`${inputClass} pr-9 ltr`}
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>رابط فيديو كلمة النائب في مجلس الشعب (YouTube)</label>
                <div className="relative">
                  <div className={iconWrapper}>
                    <Youtube className="h-4 w-4" />
                  </div>
                  <input
                    type="url"
                    value={speechVideo}
                    onChange={(e) => setSpeechVideo(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className={`${inputClass} pr-9 ltr`}
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateMut.isPending}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gold-500 px-6 py-3 text-sm font-extrabold text-navy-900 hover:bg-gold-400 transition shadow-sm disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {updateMut.isPending ? "جارٍ الحفظ..." : "حفظ التغييرات"}
            </button>
          </div>
        </form>
      </div>

      {/* Live Profile Preview Column */}
      <div className="space-y-6">
        <div className="sticky top-24 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-navy-800">معاينة الملف التعريفي المباشر</h3>

          <div className="relative overflow-hidden rounded-xl border border-navy-100 bg-navy-50/20 shadow-inner">
            {/* Header / Banner Mock */}
            <div className="relative h-24 w-full bg-navy-800">
              {coverImage ? (
                <img
                  src={coverImage}
                  alt="Cover"
                  className="h-full w-full object-cover opacity-60"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-l from-navy-900 to-navy-800" />
              )}
            </div>

            {/* Profile Content Mock */}
            <div className="relative px-4 pb-5 pt-10 text-center">
              {/* Profile Avatar Mock */}
              <div className="absolute -top-10 left-1/2 h-20 w-20 -translate-x-1/2 overflow-hidden rounded-full border-4 border-white bg-navy-100 shadow-md">
                <img
                  src={profileImage || "/src/assets/image.jpg"}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/src/assets/image.jpg";
                  }}
                />
              </div>

              {/* Name & Title */}
              <h4 className="text-base font-extrabold text-navy-800">{name || "الاسم غير مدخل"}</h4>
              <p className="mt-1 text-xs font-bold text-gold-600">{title || "الصفة البرلمانية"}</p>

              {/* Badges */}
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {party && (
                  <span className="rounded-full bg-navy-50 px-2.5 py-0.5 text-[10px] font-bold text-navy-700">
                    {party}
                  </span>
                )}
                {district && (
                  <span className="rounded-full bg-gold-50 px-2.5 py-0.5 text-[10px] font-bold text-gold-800">
                    {district}
                  </span>
                )}
              </div>

              {/* Bio Short */}
              <p className="mt-4 line-clamp-3 text-xs leading-relaxed text-navy-500">
                {bio || "لم يتم إدخال سيرة ذاتية بعد. أضف نبذة تعريفية لتعرض للزوار."}
              </p>

              {/* Committee banner */}
              {committee && (
                <div className="mt-4 rounded-lg bg-navy-900/5 p-2 text-right">
                  <div className="text-[9px] font-bold text-navy-400">اللجنة البرلمانية</div>
                  <div className="truncate text-xs font-bold text-navy-700">{committee}</div>
                </div>
              )}

              {/* Contacts */}
              <div className="mt-4 space-y-2 border-t border-navy-50 pt-4 text-right text-[11px] text-navy-600">
                {email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-navy-400" />
                    <span className="truncate ltr">{email}</span>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-navy-400" />
                    <span className="ltr">{phone}</span>
                  </div>
                )}
                {officeAddress && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-navy-400" />
                    <span className="truncate">{officeAddress}</span>
                    {mapLink && (
                      <a
                        href={mapLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-0.5 text-gold-600 hover:underline mr-1"
                        title="فتح الخريطة"
                      >
                        (الخريطة <ExternalLink className="h-2.5 w-2.5" />)
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Social Links Mock */}
              <div className="mt-4 flex justify-center gap-3 border-t border-navy-50 pt-4 text-navy-400">
                {facebook && <Facebook className="h-4 w-4 hover:text-navy-700 cursor-pointer" />}
                {twitter && <Twitter className="h-4 w-4 hover:text-navy-700 cursor-pointer" />}
                {instagram && <Instagram className="h-4 w-4 hover:text-navy-700 cursor-pointer" />}
                {youtube && <Youtube className="h-4 w-4 hover:text-navy-700 cursor-pointer" />}
                {whatsapp && (
                  <MessageCircle className="h-4 w-4 hover:text-navy-700 cursor-pointer" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
