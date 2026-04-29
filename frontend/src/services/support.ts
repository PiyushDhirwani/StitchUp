import api from './api';

export interface CreateTicketPayload {
  ticket_type: string;
  subject: string;
  description: string;
  email: string;
  phone_number: string;
  order_id?: number;
  priority?: string;
}

export const supportService = {
  createTicket: (data: CreateTicketPayload, attachment?: File) => {
    const formData = new FormData();
    formData.append('ticket_type', data.ticket_type);
    formData.append('subject', data.subject);
    formData.append('description', data.description);
    formData.append('email', data.email);
    formData.append('phone_number', data.phone_number);
    if (data.order_id) formData.append('order_id', String(data.order_id));
    if (data.priority) formData.append('priority', data.priority);
    if (attachment) formData.append('attachment', attachment);

    return api.post('/support/tickets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getMyTickets: (status?: string) =>
    api.get('/support/tickets', { params: status ? { status } : {} }),

  getTicketDetails: (ticketId: number) =>
    api.get(`/support/tickets/${ticketId}`),
};
