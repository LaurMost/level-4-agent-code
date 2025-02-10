import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import ContactPage from '@/app/contact/page';

describe('ContactPage Component', () => {
  it('renders the Contact Page with ContactForm and its elements', async () => {
    // Since ContactPage is an async server component, we await its rendered content
    const content = await ContactPage();
    render(content);

    // Check if the heading is rendered
    const heading = screen.getByText('Contact Us');
    expect(heading).toBeInTheDocument();

    // Check if the form inputs and button are present
    const nameInput = screen.getByPlaceholderText('Your Name');
    expect(nameInput).toBeInTheDocument();

    const emailInput = screen.getByPlaceholderText('Your Email');
    expect(emailInput).toBeInTheDocument();

    const messageInput = screen.getByPlaceholderText('Your Message');
    expect(messageInput).toBeInTheDocument();

    const submitButton = screen.getByRole('button', { name: /send message/i });
    expect(submitButton).toBeInTheDocument();
  });
});
