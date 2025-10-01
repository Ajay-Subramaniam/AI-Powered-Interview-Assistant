import { useEffect, useRef, useState } from 'react'
import ResumeUploadDialog from '../components/ResumeUploadDialog'
import { incrementSectionInDb, getAllOngoingInterviews, getInterviewee, incrementSubSectionInDb, updateProfileInDb, updateTimeSpentInDb, updateMessageInDb, clearOngoingInterview, updateDurationInDb, updateEvaluationResultInDb } from '../utils/indexDb'
import { useLoader } from '../components/LoaderContext'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import { AI_ScoreGeneration } from '../utils/ai';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const Interviewee = () => {
  const { closeLoader, openLoader } = useLoader()
  const [loading, setLoading] = useState(true)
  const userIdRef = useRef(null)
  const profileRef = useRef(null)
  const durationRef = useRef(0)
  const [timeSpent, setTimeSpent] = useState(0)
  const [section, setSection] = useState(0)
  const [subSection, setSubsection] = useState(0)
  const [questions, setQuestions] = useState(null)
  const [messages, setMessages] = useState([])
  const [userResponse, setUserResponse] = useState('')
  const intervalIdRef = useRef(null)
  const messagesEndRef = useRef(null);
  const preventOneTimeExecutionRef = useRef(false)
  const [disableInputFields, setDisableInputFields] = useState(false)
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchOngoingMeeting() {
      openLoader("Fetching interview data...")
      try {
        const ongoingInterviews = await getAllOngoingInterviews()
        if (ongoingInterviews.length > 0) {
          userIdRef.current = ongoingInterviews[0].id
          const interviewee = await getInterviewee(userIdRef.current)
          setSection(interviewee.section)
          setSubsection(interviewee.subSection)
          profileRef.current = interviewee.profile
          setQuestions(interviewee.questions)
          setTimeSpent(interviewee.timeSpent)
          durationRef.current = interviewee.duration
          setMessages(interviewee.messages)
          preventOneTimeExecutionRef.current = true
        }
      }
      catch (err) {
        console.error('unable to fetch data from the ongoing_meeting object store', err)
      }
      setLoading(false)
      closeLoader()
    }

    fetchOngoingMeeting()
  }, [])

  useEffect(() => {
    if (durationRef.current > 0 && durationRef.current <= timeSpent) {
      addUserMessage()
    }
  }, [timeSpent])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);


  async function updateTimeSpent() {
    setTimeSpent((prev) => {
      updateTimeSpentInDb(userIdRef.current, prev + 1)
      return prev + 1
    })
  }

  async function incrementSection(id) {
    await incrementSectionInDb(id)
    setSection(prev => prev + 1)
    setSubsection(-1)
  }

  async function incrementSubSection(id) {
    await incrementSubSectionInDb(id)
    setSubsection(prev => prev + 1)
  }

  async function addMessage(role, msg) {
    if (preventOneTimeExecutionRef.current) {
      preventOneTimeExecutionRef.current = false
      return
    }
    const newMsg = {
      sender: role,
      text: msg,
      section,
      duration: durationRef.current,
      timeSpent
    }
    setMessages(prev => [...prev, newMsg])
    await updateMessageInDb(userIdRef.current, newMsg)
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      addUserMessage()
    }
  }

  function handleSend() {
    addUserMessage()
  }

  async function updateProfile() {
    const profile_fields = ['name', 'email', 'phone']
    profileRef.current = {
      ...profileRef.current,
      [profile_fields[subSection]]: userResponse
    }
    await updateProfileInDb(userIdRef.current, profileRef.current)
  }

  async function addUserMessage() {

    await addMessage('user', userResponse)
    if (section === 1) await updateProfile()

    setUserResponse('')
    setTimeSpent(0)
    await updateTimeSpentInDb(userIdRef.current, 0)

    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current)
      intervalIdRef.current = null
    }

    await incrementSubSection(userIdRef.current)
  }

  useEffect(() => {
    async function handleProfileSection() {
      if (section !== 1) return;

      if (profileRef.current.name && profileRef.current.email && profileRef.current.phone) {
        await incrementSection(userIdRef.current)
        return
      }

      if (subSection === -1) {
        await addMessage('system', 'Unable to extract few fields.')
        await incrementSubSection(userIdRef.current)
      }
      else if (!profileRef.current.name && subSection === 0) {
        await addMessage('system', 'Please enter your name')
      }
      else if (!profileRef.current.email && subSection === 1) {
        await addMessage('system', 'Please enter your email')
      }
      else if (!profileRef.current.phone && subSection === 2) {
        await addMessage('system', 'Please enter your phone number')
      }
      else if (subSection === 3) {
        await incrementSection(userIdRef.current)
      }
    }

    handleProfileSection()
  }, [section, subSection])

  useEffect(() => {
    async function handleInterviewSection() {
      if (section !== 2) return;

      if (subSection === -1) {
        await addMessage('system', 'Let us start the interview.')
        await incrementSubSection(userIdRef.current)
      }
      else if (subSection >= 0 && subSection <= 5) {
        durationRef.current = questions[subSection].duration
        await updateDurationInDb(userIdRef.current, durationRef.current)
        await addMessage('system', questions[subSection].question)

        intervalIdRef.current = setInterval(() => {
          updateTimeSpent()
        }, 1000);
      }
      else if (subSection === 6) {
        await addMessage('system', 'Interview completed!!')
        await incrementSection(userIdRef.current)
      }
    }

    handleInterviewSection()

  }, [section, subSection])

  useEffect(() => {
    if (section === 3) {
      async function evaluation() {
        try {
          //generate ai summary and score, combine question answers and score
          openLoader('Evaluating and storing the result...')
          const QA = messages.filter(m => m.section === 2)
          const result = await AI_ScoreGeneration(QA)
          const que_ans_score = result[0]
          const totalScore = result[1]
          const aiSummary = result[2]
          await updateEvaluationResultInDb(userIdRef.current, que_ans_score, totalScore, aiSummary)
          //delete ongoing interview
          await clearOngoingInterview(userIdRef.current)
        }
        catch (err) {
          console.error('error in evaluating and updating score of candidate', err)
        }
        finally {
          closeLoader()
          setDisableInputFields(true)
        }
      }
      evaluation()
    }
  }, [section])


  if (loading) {
    return <></>
  }

  return (
    <>
      {section === 0 && (
        <ResumeUploadDialog incrementSection={incrementSection} userIdRef={userIdRef} setQuestions={setQuestions} profileRef={profileRef} />
      )}
      {(section >= 1) && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "90vh",
            p: 2,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              width: { xs: "100%", sm: "80%", md: "50%" },
              height: "80vh",
              display: "flex",
              flexDirection: "column",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton size="small" onClick={() => navigate(-1)} aria-label="back">
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6">AI Interviewer</Typography>
              </Box>
              {section === 2 && (
                <Typography color="error" fontWeight="bold">
                  {`Time Elapsed: ${timeSpent}s / Allowed: ${durationRef.current}s`}
                </Typography>
              )}
            </Box>

            <Divider />

            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                p: 2,
              }}
            >
              {messages.map((msg, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: "80%",
                      p: 1,
                      borderRadius: 2,
                      bgcolor: msg.sender === "user" ? "primary.main" : "grey.300",
                      color: msg.sender === "user" ? "white" : "black",
                    }}
                  >
                    <Typography variant="body2">{msg.text}</Typography>
                  </Box>
                </Box>
              ))}
              <Box ref={messagesEndRef} />
            </Box>
            <Divider />

            <Box
              sx={{
                p: 2,
                display: "flex",
                gap: 1,
                alignItems: "center",
              }}
            >
              <TextField
                fullWidth
                value={userResponse}
                placeholder="Type your answer..."
                variant="outlined"
                size="small"
                onChange={(e) => setUserResponse(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disableInputFields}
              />
              <Button variant="contained" onClick={handleSend} disabled={disableInputFields}>Send</Button>
            </Box>
          </Paper>
        </Box>
      )}
    </>
  )
}

export default Interviewee

