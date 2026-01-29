import React, { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { X } from "lucide-react";
import { motion } from "framer-motion";

/* =========================
   TEAM DATA (3-LEVEL STRUCTURE)
   ========================= */
const teamMembers = [
  // -------- 1st LEVEL (EXECUTIVES) --------
  {
    name: "John",
    title: "Chief Executive Officer (CEO)",
    image: "/lovable-uploads/team/John.png",
    tier: "executives",
    bio: "John provides overall strategic leadership and direction for the organization, ensuring sustainable growth, strong governance, and long-term value creation."
  },
  {
    name: "Lucy",
    title: "Managing Director (MD)",
    image: "/lovable-uploads/team/Lucy.png",
    tier: "executives",
    bio: "Lucy oversees executive operations and organizational performance, ensuring alignment between strategy, execution, and stakeholder value."
  },

  // -------- 2nd LEVEL (MANAGEMENT) --------
  {
    name: "Catherine",
    title: "Human Resource Manager",
    roles: "Talent Acquisition, Employee Relations, Training & Development",
    image: "/lovable-uploads/team/Catherine.png",
    tier: "management",
    bio: "Catherine leads human resource strategy, staff welfare, compliance, and performance management, fostering a productive and positive workplace culture."
  },
  {
    name: "Kelvin",
    title: "Head of Finance & Operations",
    roles: "Financial Management, Budgeting, Operations Oversight",
    image: "/lovable-uploads/team/Kelvin.png",
    tier: "management",
    bio: "Kelvin oversees financial control and operational efficiency, ensuring accountability, optimized resource allocation, and smooth day-to-day operations."
  },

  // -------- 3rd LEVEL (OPERATIONS) --------
  {
    name: "Musyoka",
    title: "Senior Technician",
    image: "/lovable-uploads/team/Musyoka.png",
    tier: "operations",
    bio: "Musyoka leads technical diagnostics, installations, and complex repairs, ensuring high-quality service delivery and equipment reliability."
  },
  {
    name: "Dickson",
    title: "Assistant Technician & Driver",
    image: "/lovable-uploads/team/Dickson.png",
    tier: "operations",
    bio: "Dickson supports technical operations and logistics, ensuring timely transportation, field assistance, and operational support."
  },
  {
    name: "Mercy",
    title: "Office Administrator – Nakuru",
    image: "/lovable-uploads/team/Mercy.png",
    tier: "operations",
    bio: "Mercy manages office administration and coordination at the Nakuru branch, ensuring efficient records management and office operations."
  },
  {
    name: "Dennis",
    title: "Head of Business Development – Migori",
    image: "/lovable-uploads/team/Dennis.png",
    tier: "operations",
    bio: "Dennis leads business development initiatives in the Migori region, focusing on partnerships, client acquisition, and market expansion."
  },
  {
    name: "Ngeno",
    title: "Head of Business Development – Rift Valley",
    image: "/lovable-uploads/team/Benard.png",
    tier: "operations",
    bio: "Benard drives sales growth and market penetration across the Rift Valley region through strategic partnerships and client engagement."
  }
];

/* =========================
   TEAM CARD COMPONENT
   ========================= */
const TeamCard = ({ member, setSelectedMember }) => (
  <motion.div
    onClick={() => setSelectedMember(member)}
    whileHover={{ scale: 1.05 }}
    transition={{ duration: 0.3 }}
    className="cursor-pointer bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden w-full max-w-xs"
  >
    <div className="w-full h-36 sm:h-40 bg-gray-100 dark:bg-zinc-900 flex items-center justify-center overflow-hidden">
      <img
        src={member.image}
        alt={member.name}
        className="w-full h-full object-contain p-2"
      />
    </div>
    <div className="p-4 text-center">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
        {member.name}
      </h3>
      <p className="mt-1 text-gray-600 dark:text-gray-300 text-xs sm:text-sm line-clamp-2">
        {member.title}
        {member.roles && (
          <>
            <br />
            <span className="text-xs">{member.roles}</span>
          </>
        )}
      </p>
    </div>
  </motion.div>
);

/* =========================
   MAIN TEAM PAGE
   ========================= */
const Team = () => {
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    document.body.style.overflow = selectedMember ? "hidden" : "auto";
  }, [selectedMember]);

  const grouped = {
    executives: teamMembers.filter((m) => m.tier === "executives"),
    management: teamMembers.filter((m) => m.tier === "management"),
    operations: teamMembers.filter((m) => m.tier === "operations")
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-900 text-gray-900 dark:text-white transition-colors">
      <Header />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        {/* Page Intro */}
        <div className="relative mb-12 max-w-5xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            Meet Our Team
          </h1>
          <p className="text-center text-gray-700 dark:text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">
            At Jolu Machineries, our strength lies in experienced leadership,
            effective management, and a dedicated operations team working
            together to deliver excellence.
          </p>
          <div className="absolute top-1 transform -translate-y-1 w-full flex justify-between mt-6">
            <div className="w-1/5 h-1 bg-green-700" />
            <div className="w-1/5 h-1 bg-green-700" />
          </div>
        </div>

        <div className="space-y-20 max-w-7xl mx-auto">
          {/* Executives */}
          <section>
            <h2 className="text-2xl font-bold text-center mb-6">
              Executive Leadership
            </h2>
            <div className="flex justify-center flex-wrap gap-6 sm:gap-8">
              {grouped.executives.map((m, i) => (
                <TeamCard key={i} member={m} setSelectedMember={setSelectedMember} />
              ))}
            </div>
          </section>

          {/* Management */}
          <section>
            <h2 className="text-2xl font-bold text-center mb-6">
              Management Team
            </h2>
            <div className="flex justify-center flex-wrap gap-6 sm:gap-8">
              {grouped.management.map((m, i) => (
                <TeamCard key={i} member={m} setSelectedMember={setSelectedMember} />
              ))}
            </div>
          </section>

          {/* Operations */}
          <section>
            <h2 className="text-2xl font-bold text-center mb-6">
              Operations &  Business Development
            </h2>
            <div className="flex justify-center flex-wrap gap-6 sm:gap-8">
              {grouped.operations.map((m, i) => (
                <TeamCard key={i} member={m} setSelectedMember={setSelectedMember} />
              ))}
            </div>
          </section>
        </div>

        {/* Modal */}
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-2 sm:px-4 overflow-y-auto">
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl w-full max-w-xl sm:max-w-2xl max-h-screen overflow-y-auto p-4 sm:p-6 relative">
              <button
                className="absolute top-3 right-3 text-gray-500 dark:text-gray-300 hover:text-red-600"
                onClick={() => setSelectedMember(null)}
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-center">
                <div className="w-full md:w-[40%] h-48 sm:h-60 bg-gray-100 dark:bg-zinc-700 rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={selectedMember.image}
                    alt={selectedMember.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="w-full md:w-[60%]">
                  <h2 className="text-xl sm:text-2xl font-bold">
                    {selectedMember.name}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-500 dark:text-gray-300 mb-3">
                    {selectedMember.title}
                    {selectedMember.roles && (
                      <>
                        <br />
                        <span className="text-sm">{selectedMember.roles}</span>
                      </>
                    )}
                  </p>
                  <p className="text-gray-700 dark:text-gray-200 text-sm sm:text-base text-justify leading-relaxed">
                    {selectedMember.bio}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Team;
