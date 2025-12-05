import React from 'react'

// Using Material UI icons as they're already installed
import MessageIcon from '@mui/icons-material/Message'
import AddIcon from '@mui/icons-material/Add'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import PersonIcon from '@mui/icons-material/Person'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import PsychologyIcon from '@mui/icons-material/Psychology'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import PublicIcon from '@mui/icons-material/Public'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import SearchIcon from '@mui/icons-material/Search'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'

const DeepSeekLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 1024 1024"
    className={className}
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
  >
    <path
      d="M512 0C229.23 0 0 229.23 0 512s229.23 512 512 512 512-229.23 512-512S794.77 0 512 0z"
      fill="#4D6BFE"
      fillOpacity="0"
    />
    <path
      d="M755.2 384c0-64-44.8-115.2-108.8-128-19.2-3.8-38.4-6.4-57.6-6.4-128 0-230.4 102.4-230.4 230.4 0 44.8 12.8 89.6 38.4 121.6 6.4 8.2 12.8 16 19.2 23.6 25.6 25.6 57.6 44.8 96 44.8 6.4 0 12.8 0 19.2-1.2 57.6-8.8 102.4-51.2 115.2-108.8h-70.4c-8.8 25.6-32 44.8-60.8 44.8-6.4 0-12.8-1.2-19.2-3.8-19.2-8.8-32-25.6-32-48.6 0-28.8 22.4-51.2 51.2-51.2 6.4 0 12.8 1.2 19.2 3.8 19.2 8.8 32 25.6 32 47.4h70.4c0-23-6.4-44.8-19.2-64-16-25.6-41.6-44.8-73.6-51.2-6.4-1.2-12.8-2.6-19.2-2.6-55 0-100 45-100 100s45 100 100 100c6.4 0 12.8-1.2 19.2-2.6 32-6.4 57.6-25.6 73.6-51.2 12.8-19.2 19.2-41.6 19.2-66.6h70.4z"
      fill="currentColor"
    />
    <path
      d="M512 0c282.77 0 512 229.23 512 512s-229.23 512-512 512S0 794.77 0 512 229.23 0 512 0z m0 170.667c-188.416 0-341.333 152.917-341.333 341.333s152.917 341.333 341.333 341.333 341.333-152.917 341.333-341.333S700.416 170.667 512 170.667z"
      fillOpacity="0"
    />
    <path
      d="M665.6 454.4c0-28.8-22.4-51.2-51.2-51.2-19.2 0-35.2 11.2-44.8 27.2-2.8 4.8-5 10.2-6.4 16h-51.2c2.4-19.2 10.8-36.6 23.4-50 16-17.2 38.8-28.4 64.2-28.4 10.4 0 20.4 1.8 29.8 5.2 26.6 9.6 48.2 31.2 57.8 57.8 3.4 9.4 5.2 19.4 5.2 29.8 0 12.4-2.6 24.2-7.2 35-11.2 26.2-36.6 44.6-66.2 44.6h-11.2c-29.6 0-55-18.4-66.2-44.6-4.6-10.8-7.2-22.6-7.2-35 0-47.8 38.2-86.4 85.6-86.4h51.2c2.2-20.2 11.4-38.4 25.4-52 17.6-17.2 41.6-28 68-28 53 0 96 43 96 96s-43 96-96 96c-12.4 0-24.2-2.6-35-7.2-26.2-11.2-44.6-36.6-44.6-66.2 0-1.8 0.2-3.6 0.4-5.4z"
      fill="currentColor"
    />
  </svg>
)

export const Icons = {
  Chat: MessageIcon,
  Plus: AddIcon,
  Send: ArrowUpwardIcon,
  Menu: MenuIcon,
  Close: CloseIcon,
  Bot: SmartToyIcon,
  DeepSeekLogo: DeepSeekLogo,
  User: PersonIcon,
  Down: KeyboardArrowDownIcon,
  Right: ChevronRightIcon,
  Brain: PsychologyIcon,
  Clip: AttachFileIcon,
  Globe: PublicIcon,
  Sparkles: AutoAwesomeIcon,
  Search: SearchIcon,
  SidebarIcon: MenuOpenIcon,
  MoreHorizontal: MoreHorizIcon,
}
