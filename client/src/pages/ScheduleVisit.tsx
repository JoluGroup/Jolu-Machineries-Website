import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MailIcon, PhoneIcon, UserIcon } from "lucide-react";
import Header from "@/components/Header"; // Adjust path as needed
import Footer from "@/components/Footer"; // Adjust path as needed

export default function ScheduleVisit() {
  return (
    <>
      <Header />

      <section className="min-h-screen bg-white dark:bg-zinc-900 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-center text-primary mb-4">Schedule a Visit</h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-10">
            Let us know when you’d like to visit. We’ll confirm your appointment.
          </p>

          <form
            className="space-y-6 bg-zinc-100 dark:bg-zinc-800 p-8 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Visit scheduled successfully!");
            }}
          >
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Full Name</label>
              <Input placeholder="Your full name" icon={<UserIcon className="w-4 h-4" />} />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email Address</label>
              <Input type="email" placeholder="you@example.com" icon={<MailIcon className="w-4 h-4" />} />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Phone Number</label>
              <Input type="tel" placeholder="+254 7XX XXX XXX" icon={<PhoneIcon className="w-4 h-4" />} />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Preferred Date & Time</label>
              <Input
                type="datetime-local"
                className="scroll-smooth overflow-auto"
                icon={<CalendarIcon className="w-4 h-4" />}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Message (optional)</label>
              <Textarea placeholder="Let us know anything specific…" className="resize-none" />
            </div>

            <Button type="submit" className="w-full">
              Schedule Visit
            </Button>
          </form>
        </div>
      </section>

      <Footer />

    </>
  );
}
