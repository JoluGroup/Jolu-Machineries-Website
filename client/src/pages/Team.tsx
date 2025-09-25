import React, { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { X } from "lucide-react";
import { motion } from "framer-motion";

const teamMembers = [
  {
    name: "John",
    title: "Chief Executive Officer",
    image: "/lovable-uploads/team/John.png",
    tier: "executives",
    bio: "With over 15 years of industry experience, John has led Jolu Machineries from a humble beginning to becoming Kenya's leading dealer for Zoomlion agricultural equipment. His dedication to farmer success and innovative practices have shaped the company’s trusted reputation nationwide."
  },
  {
    name: "Lucy",
    title: "Managing Director",
    image: "/lovable-uploads/team/Lucy.png",
    tier: "executives",
    bio: "Lucy brings strong leadership in business operations and customer service. Her strategic insight and passion for agricultural advancement have been instrumental in building strong partnerships and delivering value to clients across Kenya."
  },
  {
    name: "Shem",
    title: "Director of Operations",
    roles: "Overall Operations, After Sales Services and Customer Relations, In-charge of all Company Documentation and Contracts, Digital Marketing & Graphic Design",
    image: "/lovable-uploads/team/Shem.png",
    tier: "management",
    bio: "Shem oversees operational strategy and execution, ensuring efficiency and consistency in service delivery. His leadership drives smooth coordination across departments and enhances customer satisfaction."
  },
  {
    name: "Kelvin",
    title: "General Manager",
    roles: "Finance, HR, IT and Sales Management",
    image: "/lovable-uploads/team/Kelvin.png",
    tier: "management",
    bio: "Kelvin provides overall leadership and direction for Jolu Machineries. His vision for growth and commitment to excellence continues to strengthen the company’s position as a trusted partner for farmers across Kenya."
  },
  {
    name: "Dennis",
    title: "Head of Operations and Business Development",
    image: "/lovable-uploads/team/Dennis.png",
    tier: "operations",
    bio: "Dennis brings extensive experience in business development and operations management. He is dedicated to expanding our market reach and optimizing our service delivery to meet the evolving needs of our clients."
  },
  {
    name: "Hesbon",
    title: "Business Partner",
    image: "/lovable-uploads/team/Hesbon.png",
    tier: "partner",
    bio: "A long-standing partner in Jolu’s mission, Hesbon drives regional business development and customer relationships. His deep understanding of Kenya’s agricultural landscape helps deliver tailored equipment solutions to our farming communities."
  }
];

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

const Team = () => {
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    document.body.style.overflow = selectedMember ? "hidden" : "auto";
  }, [selectedMember]);

  const grouped = {
    executives: teamMembers.filter((m) => m.tier === "executives"),
    management: teamMembers.filter((m) => m.tier === "management"),
    operations: teamMembers.filter((m) => m.tier === "operations"),
    partner: teamMembers.filter((m) => m.tier === "partner")
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-900 text-gray-900 dark:text-white transition-colors">
      <Header />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="relative mb-12 max-w-5xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            Meet Our Team
          </h1>
          <p className="text-center text-gray-700 dark:text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">
            At Jolu Machineries, we believe that strong partnerships begin with strong leadership. Our dedicated team brings decades of experience, commitment to agricultural innovation, and a passion for transforming Kenya’s farming landscape.
          </p>
          <div className="absolute top-1 transform -translate-y-1 w-full flex justify-between mt-6">
            <div className="w-1/5 h-1 bg-green-700" />
            <div className="w-1/5 h-1 bg-green-700" />
          </div>
        </div>

        <div className="space-y-16 max-w-7xl mx-auto">
          {/* Executive Section (John & Lucy) */}
          <div className="flex justify-center flex-wrap gap-6 sm:gap-8">
            {grouped.executives.map((m, i) => (
              <TeamCard key={i} member={m} setSelectedMember={setSelectedMember} />
            ))}
          </div>

          {/* Management Section (Shem & Kelvin) */}
          <div className="flex justify-center flex-wrap gap-6 sm:gap-8">
            {grouped.management.map((m, i) => (
              <TeamCard key={i} member={m} setSelectedMember={setSelectedMember} />
            ))}
          </div>

          {/* Operations Section (Dennis) */}
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Our Operations</h2>
            <div className="flex justify-center flex-wrap gap-6 sm:gap-8">
              {grouped.operations.map((m, i) => (
                <TeamCard key={i} member={m} setSelectedMember={setSelectedMember} />
              ))}
            </div>
          </div>

          {/* Partners Section (Hesbon) */}
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Our Partners</h2>
            <div className="flex justify-center flex-wrap gap-6 sm:gap-8">
              {grouped.partner.map((m, i) => (
                <TeamCard key={i} member={m} setSelectedMember={setSelectedMember} />
              ))}
            </div>
          </div>
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