import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@material-ui/core';

interface CreateQuestionDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface QuestionData {
    name: string;
    difficulty: number;
    imageUrl?: string;
}

interface AnswerData {
    answerName: string;
    isCorrect: boolean;
    imageUrl?: string;
    image?: File;
}

const CreateQuestionDialog: React.FC<CreateQuestionDialogProps> = ({ open, onClose, onSuccess }) => {
    const [question, setQuestion] = useState<QuestionData>({
        name: '',
        difficulty: 1
    });
    const [questionImage, setQuestionImage] = useState<File | null>(null);
    const [answers, setAnswers] = useState<AnswerData[]>([]);

    const handleImageUpload = async (file: File, type: 'question' | 'answer') => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', type === 'question' ? 'questions' : 'answers');

            const endpoint = type === 'question' 
                ? 'http://localhost:8080/api/questions/upload'
                : 'http://localhost:8080/api/answers/upload';

            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            return data.imageUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    const handleSubmit = async () => {
        try {
            // 1. Upload question image first if exists
            let questionImageUrl = null;
            if (questionImage) {
                questionImageUrl = await handleImageUpload(questionImage, 'question');
            }

            // 2. Create question with image URL
            const questionData = {
                ...question,
                imageUrl: questionImageUrl
            };

            const questionResponse = await fetch('http://localhost:8080/api/questions/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(questionData),
                credentials: 'include',
            });

            if (!questionResponse.ok) {
                throw new Error('Failed to create question');
            }

            const createdQuestion = await questionResponse.json();

            // 3. Upload answer images and create answers
            const answersWithImages = await Promise.all(
                answers.map(async (answer) => {
                    let answerImageUrl = null;
                    if (answer.image) {
                        answerImageUrl = await handleImageUpload(answer.image, 'answer');
                    }
                    return {
                        ...answer,
                        imageUrl: answerImageUrl,
                        questionId: createdQuestion.id
                    };
                })
            );

            // 4. Create answers with their images
            const answersResponse = await fetch('http://localhost:8080/api/answers/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(answersWithImages),
                credentials: 'include',
            });

            if (!answersResponse.ok) {
                throw new Error('Failed to create answers');
            }

            onClose();
            onSuccess();
        } catch (error) {
            console.error('Error creating question and answers:', error);
            // Handle error appropriately
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Create New Question</DialogTitle>
            <DialogContent>
                {/* Add your form fields here */}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} color="primary">Create</Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateQuestionDialog; 