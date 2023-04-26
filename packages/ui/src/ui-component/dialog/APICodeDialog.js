import { createPortal } from 'react-dom'
import { useState } from 'react'
import PropTypes from 'prop-types'

import { Tabs, Tab, Dialog, DialogContent, DialogTitle, Box } from '@mui/material'
import { CopyBlock, atomOneDark } from 'react-code-blocks'
import { baseURL } from 'store/constant'
import pythonSVG from 'assets/images/python.svg'
import javascriptSVG from 'assets/images/javascript.svg'
import cURLSVG from 'assets/images/cURL.svg'
import EmbedSVG from 'assets/images/embed.svg'

function TabPanel(props) {
    const { children, value, index, ...other } = props
    return (
        <div
            role='tabpanel'
            hidden={value !== index}
            id={`attachment-tabpanel-${index}`}
            aria-labelledby={`attachment-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
        </div>
    )
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired
}

function a11yProps(index) {
    return {
        id: `attachment-tab-${index}`,
        'aria-controls': `attachment-tabpanel-${index}`
    }
}

const APICodeDialog = ({ show, dialogProps, onCancel }) => {
    const portalElement = document.getElementById('portal')
    const codes = ['Embed', 'Python API', 'JavaScript API', 'JavaScript Code', 'cURL']
    const [value, setValue] = useState(0)

    const handleChange = (event, newValue) => {
        setValue(newValue)
    }

    const getCode = (codeLang) => {
        if (codeLang === 'Python API') {
            return `import requests

API_URL = "${baseURL}/api/v1/prediction/${dialogProps.chatflowid}"

def query(payload):
    response = requests.post(API_URL, json=payload)
    return response.json()
    
output = query({
    "question": "Hey, how are you?",
})
`
        } else if (codeLang === 'JavaScript API') {
            return `async function query(data) {
    const response = await fetch(
        "${baseURL}/api/v1/prediction/${dialogProps.chatflowid}",
        {
            method: "POST",
            body: {
                "question": "Hey, how are you?"
            },
        }
    );
    const result = await response.json();
    return result;
}
`
        } else if (codeLang === 'Embed') {
            return `<script type="module">
    import Chatbot from "https://cdn.jsdelivr.net/npm/flowise-embed@latest/dist/web.js"
    Chatbot.init({
        chatflowid: "${dialogProps.chatflowid}",
        apiHost: "${baseURL}",
    })
</script>
`
        } else if (codeLang === 'cURL') {
            return `curl ${baseURL}/api/v1/prediction/${dialogProps.chatflowid} \\
     -X POST \\
     -d '{"question": "Hey, how are you?"}'`
        } else if (codeLang === 'JavaScript Code') {
            return dialogProps ? dialogProps.exportedCode : ''
        }
        return ''
    }

    const getLang = (codeLang) => {
        if (codeLang === 'Python API') {
            return 'python'
        } else if (codeLang === 'JavaScript API' || codeLang === 'Embed' || codeLang === 'JavaScript Code') {
            return 'javascript'
        } else if (codeLang === 'cURL') {
            return 'bash'
        }
        return 'python'
    }

    const getSVG = (codeLang) => {
        if (codeLang === 'Python API') {
            return pythonSVG
        } else if (codeLang === 'JavaScript API' || codeLang === 'JavaScript Code') {
            return javascriptSVG
        } else if (codeLang === 'Embed') {
            return EmbedSVG
        } else if (codeLang === 'cURL') {
            return cURLSVG
        }
        return pythonSVG
    }

    const component = show ? (
        <Dialog
            open={show}
            fullWidth
            maxWidth='md'
            onClose={onCancel}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
        >
            <DialogTitle sx={{ fontSize: '1rem' }} id='alert-dialog-title'>
                {dialogProps.title}
            </DialogTitle>
            <DialogContent>
                <Tabs value={value} onChange={handleChange} aria-label='tabs'>
                    {codes.map((codeLang, index) => (
                        <Tab
                            icon={
                                <img
                                    style={{ objectFit: 'cover', height: 15, width: 'auto', marginLeft: 10 }}
                                    src={getSVG(codeLang)}
                                    alt='code'
                                />
                            }
                            iconPosition='left'
                            key={index}
                            label={codeLang}
                            {...a11yProps(index)}
                        ></Tab>
                    ))}
                </Tabs>
                <div style={{ marginTop: 10 }}></div>
                {codes.map((codeLang, index) => (
                    <TabPanel key={index} value={value} index={index}>
                        {codeLang === 'Embed' && (
                            <>
                                <span>
                                    Paste this anywhere in the <code>{`<body>`}</code> tag of your html file
                                </span>
                                <div style={{ height: 10 }}></div>
                            </>
                        )}
                        <CopyBlock
                            theme={atomOneDark}
                            text={getCode(codeLang)}
                            language={getLang(codeLang)}
                            showLineNumbers={false}
                            wrapLines
                        />
                    </TabPanel>
                ))}
            </DialogContent>
        </Dialog>
    ) : null

    return createPortal(component, portalElement)
}

APICodeDialog.propTypes = {
    show: PropTypes.bool,
    dialogProps: PropTypes.object,
    onCancel: PropTypes.func
}

export default APICodeDialog
