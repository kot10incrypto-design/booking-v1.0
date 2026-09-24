import { useMemo } from 'react';
import { Appointment, ClientProfile } from '../types';
import { normalizePhoneNumber } from '../utils/customerUtils';
import { getCurrentSolarDateInfo } from '../utils/dateUtils';

/**
 * Robust hook to retrieve the nearest active or upcoming appointment
 * prioritizes Customer ID -> Normalized Phone -> Name match.
 */
export function useUpcomingAppointment(
  appointments: Appointment[],
  currentCustomer: ClientProfile | null
): Appointment | null {
  return useMemo(() => {
    if (!currentCustomer) return null;

    const normCustomerPhone = normalizePhoneNumber(currentCustomer.phone);
    const trimmedCustomerName = currentCustomer.name.trim().toLowerCase();

    const userAppointments = appointments.filter((apt) => {
      // 1. Primary: Exact Customer ID match
      if (apt.customerId && apt.customerId === currentCustomer.id) {
        return true;
      }
      // 2. Secondary: Normalized Phone match
      if (apt.customerPhone && normCustomerPhone && normalizePhoneNumber(apt.customerPhone) === normCustomerPhone) {
        return true;
      }
      // 3. Last Resort Fallback: Trimmed lowercase name match
      if (apt.customerName && apt.customerName.trim().toLowerCase() === trimmedCustomerName) {
        return true;
      }
      return false;
    });

    const activeList = userAppointments.filter(
      (apt) => apt.status === 'confirmed' || apt.status === 'in_progress' || apt.status === 'reserved'
    );

    if (activeList.length > 0) {
      const currentDay = getCurrentSolarDateInfo().dayNumber;
      activeList.sort((a, b) => {
        const diffA = (a.dayNumber - currentDay + 31) % 31;
        const diffB = (b.dayNumber - currentDay + 31) % 31;
        if (diffA !== diffB) return diffA - diffB;
        return a.startTime.localeCompare(b.startTime);
      });
      return activeList[0];
    }

    return null;
  }, [appointments, currentCustomer]);
}
