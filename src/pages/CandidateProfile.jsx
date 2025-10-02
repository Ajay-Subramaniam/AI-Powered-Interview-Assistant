import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Box,
    Paper,
    Typography,
    Divider,
    Button,
} from "@mui/material";
import { getInterviewee } from "../utils/indexdb";
import { useLoader } from "../components/LoaderContext";
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChatHistoryDialog from '../components/ChatHistoryDialog';

const CandidateProfile = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [candidate, setCandidate] = useState(null);
    const { closeLoader, openLoader } = useLoader()
    const [openChat, setOpenChat] = useState(false)
    useEffect(() => {
        async function fetchCandidate() {
            const data = await getInterviewee(id);
            setCandidate(data);
        }
        fetchCandidate();
    }, [id]);

    if (!candidate) {
        openLoader()
        return <></>
    }
    else {
        closeLoader()
    }



    return (
        <Box
            sx={{
                p: 3,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 3,
                height: 'auto',
            }}
        >
            <Box sx={{ flex: 2 }}>
                <Paper
                    sx={{
                        p: 2,
                        height: { md: '80vh', xs: 'auto' },
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Box sx={{ flexShrink: 0 }}>
                        <Typography variant="h6" gutterBottom>
                            Questions & Answers
                        </Typography>
                        <Divider />
                    </Box>

                    <Box
                        sx={{
                            overflowY: 'auto',
                            mt: 2,
                            pr: 1,
                            flexGrow: 1,
                            maxHeight: { md: '100%', xs: 'none' },
                        }}
                    >
                        {candidate.que_ans_score?.map((q) => (
                            <Box key={q.id} mb={2}>
                                <Typography fontWeight="bold">
                                    {q.difficulty.toUpperCase()} - Score: {q.obtained_score}/{q.maximum_score}
                                </Typography>
                                <Typography variant="body1">{q.id}. {q.question}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Ans: {q.answer}
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                            </Box>
                        ))}
                    </Box>
                </Paper>

                <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ mt: 2 }}
                >
                    Back
                </Button>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Profile
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography color="text.secondary">Name:</Typography>
                        <Typography>{candidate.profile?.name}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography color="text.secondary">Email:</Typography>
                        <Typography>{candidate.profile?.email}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography color="text.secondary">Phone:</Typography>
                        <Typography>{candidate.profile?.phone}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography color="text.secondary">Total Score:</Typography>
                        <Typography>{candidate.totalScore}/60</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                        <Typography color="text.secondary" noWrap>
                            User ID:
                        </Typography>
                        <Typography noWrap>{candidate.id}</Typography>
                    </Box>
                </Paper>

                <Paper sx={{ p: 1 }}>
                    <Box display='flex' gap={1}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => {
                                const blob = new Blob([candidate.resume], { type: "application/pdf" });
                                const url = URL.createObjectURL(blob);
                                window.open(url, "_blank");
                            }}
                        >
                            Resume
                        </Button>
                        <Button fullWidth variant="contained" onClick={() => setOpenChat(true)}>
                            Chat History
                        </Button>
                    </Box>

                </Paper>

                <Paper sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" gutterBottom>
                        AI Summary
                    </Typography>
                    <Box sx={{ overflowY: 'auto', flexGrow: 1, maxHeight: 200 }}>
                        <Typography variant="body2">{candidate.aiSummary}</Typography>
                    </Box>
                </Paper>
            </Box>
            <ChatHistoryDialog
                open={openChat}
                onClose={() => setOpenChat(false)}
                messages={candidate.messages}
            />
        </Box>

    );
};

export default CandidateProfile;
