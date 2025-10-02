import { useState, useRef } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
} from "@mui/material";
import { v4 as uuidv4 } from 'uuid';
import { infoExtractionAndQuestionGeneration } from "../utils/ai";
import { addInterviewee, setOngoingInterview } from "../utils/indexdb";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { useLoader } from "./LoaderContext";

export default function ResumeUploadDialog({ incrementSection, userIdRef, setQuestions, profileRef }) {
    const { openLoader, closeLoader } = useLoader()
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [open, setOpen] = useState(true);
    const [disableUpload, setDisableUpload] = useState(true)
    const [fileURL, setFileURL] = useState(null);
    const fileInputRef = useRef(null)
    const navigate = useNavigate();
    const MAX_SIZE_MB = 10;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];

        if (file) {
            const isPDF = file.type === "application/pdf";

            if (!isPDF) {
                setError("* Please upload a PDF file.");
                setFile(null);
                setDisableUpload(true)
                return;
            }

            if (file.size > MAX_SIZE_BYTES) {
                setError(`* File size exceeds ${MAX_SIZE_MB}MB. Please upload a smaller file.`);
                setFile(null);
                setDisableUpload(true)
                return;
            }

            setFile(file);
            const url = URL.createObjectURL(file);
            setFileURL(url)
            setDisableUpload(false)
            setError("");
        }
    };

    const handleClickClose = () => {
        setOpen(false);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleNext = async () => {
        if (file) {
            handleClickClose()
            openLoader('Analyzing your resume and preparing your interview questions...')
            try {
                const res = await infoExtractionAndQuestionGeneration(file)
                const profile = res[0]
                const questions = res[1]
                const id = uuidv4()
                userIdRef.current = id
                profileRef.current = profile
                setQuestions(questions)
                const intervieweeObj = {
                    id,
                    profile,
                    resume: file,
                    questions,
                    que_ans_score: [],
                    totalScore: 0,
                    messages: [],
                    aiSummary: '',
                    section: 0,
                    subSection: 0,
                    timeSpent: 0,
                    duration: 0,
                    currentUserResponse:''
                }
                await addInterviewee(intervieweeObj)
                await setOngoingInterview(id)
                await incrementSection(id)
                URL.revokeObjectURL(fileURL);
                closeLoader()
            }
            catch (err) {
                console.error(err);
                setError("* Something went wrong while processing your resume.Please try again.");
                handleClickOpen()
                closeLoader()
            }
        } else {
            setError("No file selected!");
        }
    };

    function handlePreview() {
        if (fileURL) {
            window.open(fileURL, '_blank')
        }
    }
    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    return (
        <Dialog open={open} fullWidth maxWidth="sm">
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="div">
                    🧠 Interview Overview
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={() => navigate(-1)}
                    sx={{ color: (theme) => theme.palette.grey[500] }}
                    size="small"
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>

                <Box sx={{ mb: 3, backgroundColor: '#f9f9f9', p: 2, borderRadius: 1 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                        📌 Question Format
                    </Typography>
                    <Typography variant="body2">
                        You will be asked <strong>6 questions</strong>: from React/Node.
                    </Typography>
                    <ul style={{ margin: '8px 0 0 16px', paddingLeft: 0 }}>
                        <li><Typography variant="body2">2 Easy &mdash; <strong>20 seconds</strong> each</Typography></li>
                        <li><Typography variant="body2">2 Medium &mdash; <strong>60 seconds</strong> each</Typography></li>
                        <li><Typography variant="body2">2 Hard &mdash; <strong>120 seconds</strong> each</Typography></li>
                    </ul>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        📂 Upload Your Resume
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        Please upload your resume (PDF format, max {MAX_SIZE_MB}MB).
                    </Typography>

                    <Box sx={{ gap: 1 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                            />
                            <Button
                                variant="text"
                                startIcon={<UploadFileIcon />}
                                onClick={triggerFileInput}
                            >
                                Choose Resume
                            </Button>
                            {file && (
                                <Typography variant="body2" color="text.secondary">
                                    {file.name}
                                </Typography>
                            )}
                        </Box>

                        {file && (
                            <Button
                                variant="text"
                                size="small"
                                startIcon={<VisibilityIcon />}
                                onClick={handlePreview}
                            >
                                Preview
                            </Button>
                        )}
                    </Box>
                </Box>

                {error && (
                    <Typography color="error" sx={{ mt: 1 }}>
                        {error}
                    </Typography>
                )}

            </DialogContent>

            <DialogActions>
                <Button onClick={handleNext} variant="contained" color="primary" disabled={disableUpload} >
                    Start
                </Button>
            </DialogActions>
        </Dialog>
    );
}