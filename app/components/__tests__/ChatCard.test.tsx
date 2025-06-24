import ChatCard from '@/app/components/ChatCard';
import { ChatWithParticipants, UserProfile } from '@/utils/models';
import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';

// Mock the router hook
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
}));

describe('<ChatCard />', () => {
    const mockRouterPush = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: mockRouterPush,
        });
    });

    const mockTutor: UserProfile = {
        id: 'user1',
        first_name: 'John',
        last_name: 'Smith',
        profile_icon_url: 'http://example.com/john.jpg',
        last_online_at: new Date().toISOString(),
        location: 'Singapore',          
        role: 'tutor',              
        email: 'john.smith@example.com', 
    }

    const mockStudent: UserProfile = {
        id: 'user2',
        first_name: 'Jane',
        last_name: 'Doe',
        profile_icon_url: 'http://example.com/jane.jpg',
        last_online_at: new Date().toISOString(),
        location: 'Singapore',          
        role: 'student',              
        email: 'jane.doe@example.com', 
    };

    const baseChat: ChatWithParticipants = {
        id: 1,
        tutor_id: 'user1',
        student_id: 'user2',              
        created_at: new Date().toISOString(),  
        unread_count_tutor: 0,            
        unread_count_student: 5,          
        student: mockStudent,
        tutor: mockTutor,
        unread_count: 5,
        updated_at: new Date().toISOString(),
        last_message: {
            id: 1,
            content: 'Hello there!',
            created_at: new Date().toISOString(),
            sender_id: 'user1'
        },
    };

    test('renders correctly with unread messages and last message content', () => {
    const { getByText } = render(
        <ChatCard chat={baseChat} currentUserId="user1" />
    );

    // Should display the other user name
    getByText('Jane Doe');

    // Should display last message content
    getByText('Hello there!');

    // Should display unread count badge
    getByText('5');
    });

    test('Renders "No messages yet" if no last message', () => {
        const chatWithoutLastMessage = {
            ...baseChat,
            last_message: undefined,
        };

        const { getByText } = render(
            <ChatCard chat={chatWithoutLastMessage} currentUserId="user1" />
        );

        getByText('No messages yet');
    });

    test('Does not display unread badge if unread_count is zero', () => {
        const chatWithNoUnread = {
            ...baseChat,
            unread_count: 0,
        };

        const { queryByText } = render(
            <ChatCard chat={chatWithNoUnread} currentUserId="user1" />
        );

        expect(queryByText('0')).toBeNull();
    });

    test('Navigates to chat screen on press with correct params', () => {
        const { getByRole } = render(
            <ChatCard chat={baseChat} currentUserId="user1" />
        );

        fireEvent.press(getByRole('button'));

        expect(mockRouterPush).toHaveBeenCalledTimes(1);
        const callArg = mockRouterPush.mock.calls[0][0];

        expect(callArg.pathname).toBe('/chat/1');

        const otherUser = JSON.parse(callArg.params.otherUser);
        expect(otherUser.id).toBe('user2'); 
        expect(otherUser.role).toBe('student');
    });
});
