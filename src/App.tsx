import React, { useState } from 'react';
import { SalonProvider, useSalon } from './context/SalonContext';
import { Procedure, GalleryWork } from './types';

// Client components
import { ClientNavbar } from './components/client/ClientNavbar';
import { ClientHome } from './components/client/ClientHome';
import { BookingFlowModal } from './components/client/BookingFlowModal';
import { ProcedureDetailModal } from './components/client/ProcedureDetailModal';
import { GalleryLightboxModal } from './components/client/GalleryLightboxModal';
import { AdminLoginModal } from './components/client/AdminLoginModal';
import { AppointmentNotificationBanner } from './components/common/AppointmentNotificationBanner';

// Admin components
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminCalendar } from './components/admin/AdminCalendar';
import { AdminClients } from './components/admin/AdminClients';
import { AdminProcedures } from './components/admin/AdminProcedures';
import { AdminGallery } from './components/admin/AdminGallery';
import { AdminFinancial } from './components/admin/AdminFinancial';
import { AdminReports } from './components/admin/AdminReports';
import { AdminSettings } from './components/admin/AdminSettings';

const MainApp: React.FC = () => {
  const {
    viewMode,
    adminTab,
    setAdminTab,
    setViewMode,
    isAdminAuthenticated,
    lastCreatedAppointment,
    clearNotification,
  } = useSalon();

  // Modals for Client View
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedBookingProcedure, setSelectedBookingProcedure] = useState<Procedure | null>(null);
  const [selectedDetailProcedure, setSelectedDetailProcedure] = useState<Procedure | null>(null);
  const [selectedGalleryWork, setSelectedGalleryWork] = useState<GalleryWork | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  const handleStartBooking = (procedure?: Procedure) => {
    if (procedure) {
      setSelectedBookingProcedure(procedure);
    } else {
      setSelectedBookingProcedure(null);
    }
    setIsBookingOpen(true);
  };

  const handleOpenProcedureDetail = (procedure: Procedure) => {
    setSelectedDetailProcedure(procedure);
  };

  const handleOpenGalleryLightbox = (work: GalleryWork) => {
    setSelectedGalleryWork(work);
  };

  const handleViewNotificationAppointment = () => {
    if (isAdminAuthenticated) {
      setViewMode('admin');
      setAdminTab('calendar');
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  return (
    <>
      {/* Real-time Ringtone Notification Banner for Owner */}
      <AppointmentNotificationBanner
        appointment={lastCreatedAppointment}
        onClose={clearNotification}
        onViewAppointment={handleViewNotificationAppointment}
      />

      {/* ADMIN VIEW - STRICTLY PROTECTED BY PIN AUTHENTICATION */}
      {viewMode === 'admin' && isAdminAuthenticated ? (
        <AdminLayout>
          {adminTab === 'dashboard' && <AdminDashboard />}
          {adminTab === 'calendar' && <AdminCalendar />}
          {adminTab === 'clients' && <AdminClients />}
          {adminTab === 'procedures' && <AdminProcedures />}
          {adminTab === 'gallery' && <AdminGallery />}
          {adminTab === 'financial' && <AdminFinancial />}
          {adminTab === 'reports' && <AdminReports />}
          {adminTab === 'settings' && <AdminSettings />}
        </AdminLayout>
      ) : (
        /* PUBLIC CLIENT VIEW - ALWAYS DEFAULT FOR VISITORS AND SHARED LINKS */
        <div className="min-h-screen bg-[#FDFBF9] text-[#2D2926] flex flex-col font-sans selection:bg-[#EAE4DD] selection:text-[#8E5D52]">
          {/* Client Header Navbar */}
          <ClientNavbar
            onOpenBooking={() => handleStartBooking()}
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          />

          {/* Main Client Homepage */}
          <ClientHome
            onOpenBookingWithProcedure={handleStartBooking}
            onOpenProcedureDetails={handleOpenProcedureDetail}
            onOpenGalleryZoom={handleOpenGalleryLightbox}
          />

          {/* 5-Step Booking Flow Modal */}
          <BookingFlowModal
            isOpen={isBookingOpen}
            onClose={() => setIsBookingOpen(false)}
            initialProcedure={selectedBookingProcedure}
          />

          {/* Procedure Detail Modal */}
          <ProcedureDetailModal
            procedure={selectedDetailProcedure}
            onClose={() => setSelectedDetailProcedure(null)}
            onBookProcedure={(proc) => {
              setSelectedDetailProcedure(null);
              handleStartBooking(proc);
            }}
          />

          {/* Gallery Lightbox Modal */}
          <GalleryLightboxModal
            work={selectedGalleryWork}
            onClose={() => setSelectedGalleryWork(null)}
            onBookProcedure={(proc) => {
              setSelectedGalleryWork(null);
              handleStartBooking(proc);
            }}
          />

          {/* Admin PIN Login Modal */}
          <AdminLoginModal
            isOpen={isAdminLoginOpen}
            onClose={() => setIsAdminLoginOpen(false)}
          />
        </div>
      )}
    </>
  );
};

export default function App() {
  return (
    <SalonProvider>
      <MainApp />
    </SalonProvider>
  );
}
