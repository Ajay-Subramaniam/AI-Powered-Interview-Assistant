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

export default function ResumeUploadDialog({ incrementSection, userIdRef, setQuestions, profileRef }) {
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [open, setOpen] = useState(true);
    const [disableUpload, setDisableUpload] = useState(true)
    const [fileURL, setFileURL] = useState(null);
    const MAX_SIZE_MB = 10;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
    const [nextLoading, setNextLoading] = useState(false)
    const fileInputRef = useRef(null)
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];

        if (file) {
            const isPDF = file.type === "application/pdf";

            if (!isPDF) {
                setError("Please upload a PDF file.");
                setFile(null);
                setDisableUpload(true)
                return;
            }

            if (file.size > MAX_SIZE_BYTES) {
                setError(`File size exceeds ${MAX_SIZE_MB}MB. Please upload a smaller file.`);
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

    const handleNext = async () => {
        if (file) {
            setNextLoading(true)
            const res = await infoExtractionAndQuestionGeneration(file)
            const profile = res[0]
            const questions = res[1]
            const id = uuidv4()
            userIdRef.current = id
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
                duration: 0
            }
            profileRef.current = profile
            setQuestions(questions)
            try {
                await addInterviewee(intervieweeObj)
                await setOngoingInterview(id)
                await incrementSection(id)
            }
            catch (err) {
                console.error(err);
                setError("Something went wrong while processing your resume.");
            }
            URL.revokeObjectURL(fileURL);
            handleClickClose();
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
                    📂 Upload Resume
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={() => navigate(-1)}
                    sx={{
                        color: (theme) => theme.palette.grey[500],
                    }}
                    size="small"
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Typography gutterBottom>
                    Please upload your resume (PDF format, max {MAX_SIZE_MB}MB).
                </Typography>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                />
                <Button
                    variant="outlined"
                    startIcon={<UploadFileIcon />}
                    onClick={triggerFileInput}
                    sx={{ mt: 2 }}
                >
                    Choose Resume
                </Button>
                {file && (
                    <Box sx={{ gap: 1 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ my: 1 }}>
                            Selected file:<br />
                            {file.name}<br />
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </Typography>
                        <Button
                            variant="text"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={handlePreview}
                            sx={{ mt: 1 }}
                        >
                            Preview
                        </Button>
                    </Box>
                )}
                {error && (
                    <Typography color="error" sx={{ mt: 1 }}>
                        {error}
                    </Typography>
                )}
                {nextLoading && (
                    <Typography color="error" sx={{ mt: 1 }}>
                        Extracting Info. & Preparing Questions...
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleNext} variant="contained" color="primary" disabled={disableUpload} loading={nextLoading}>
                    Next
                </Button>
            </DialogActions>
        </Dialog>
    );
}