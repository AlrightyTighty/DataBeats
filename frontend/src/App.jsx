import "./App.css";

import _appLogo from "./assets/graphics/DataBeats_Logo.png";

import { createBrowserRouter, RouterProvider } from "react-router";
import "./index.css";
import { PlaybarProvider } from "./contexts/PlaybarContext";
import { ModalProvider, useModal } from "./contexts/ModalContext";
import Layout from "./Components/Layout";
import Modal from "./Components/Modal";

import Login from "./Pages/Login.jsx";
import Signup from "./Pages/Signup.jsx";
import Authtest from "./Pages/Authtest.jsx";
import Register from "./Pages/Register.jsx";
import SongInfo from "./Pages/SongInfo.jsx";
import MusicianDashboard from "./Pages/MusicianDashboard.jsx";
import StreamPopupTest from "./Pages/StreamPopupTest.jsx";
import Events from "./Pages/Events.jsx";
import EventDetails from "./Pages/EventDetails.jsx";
import CreateEvent from "./Pages/CreateEvent.jsx";
import CreateAlbum from "./Pages/CreateAlbum.jsx";
import EditAlbum from "./Pages/EditAlbum.jsx";
import SearchResult from "./Pages/SearchResult.jsx";
import Playlists from "./Pages/Playlists.jsx";
import CreatePlaylist from "./Pages/CreatePlaylist.jsx";
import Admin from "./Pages/Admin.jsx";
import Report from "./Pages/Report.jsx";
import UserPlaylists from "./Pages/UserPlaylists.jsx";
import ListenerMe from "./Pages/ListenerMe.jsx";
import ListenerPublic from "./Pages/ListenerPublic.jsx";
import ArtistProfileUser from "./Pages/ArtistProfileUser.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import ArtistEvents from "./Pages/ArtistEvents.jsx";
import ArtistAlbum from "./Pages/ArtistAlbum.jsx";
import Settings from "./Pages/Settings.jsx";
import NewReleases from "./Pages/NewReleases.jsx";
import Album from "./Pages/Album.jsx";
import Albums from "./Pages/Albums.jsx";
import Artists from "./Pages/Artists.jsx";
import PlaylistPage from "./Pages/PlaylistPage.jsx";
import GenerateReport from "./Pages/GenerateReport.jsx";
import ReportResult from "./Pages/ReportResult.jsx";
import NotFound from "./Pages/NotFound.jsx";
import History from "./Pages/History.jsx";
import Logout from "./Pages/Logout.jsx";
import Follow from "./Pages/Follow.jsx";
import RecentPlays from "./Pages/RecentPlays.jsx";

function App() {
  const router = createBrowserRouter([
    {
      element: <Layout />,
      children: [
        { path: "/", element: <Login /> },
        { path: "/login", element: <Login /> },
        { path: "/signup", element: <Signup /> },
        { path: "/register", element: <Register /> },
        { path: "/authtest", element: <Authtest /> },
        { path: "/songinfo/:id", element: <SongInfo /> },
        { path: "/musician-dashboard/:id", element: <MusicianDashboard /> },
        { path: "/streamtest", element: <StreamPopupTest /> },
        { path: "/events", element: <Events /> },
        { path: "/event/:id", element: <EventDetails /> },
        { path: "/createevent", element: <CreateEvent /> },
        { path: "/createalbum", element: <CreateAlbum /> },
        { path: "/editalbum/:id", element: <EditAlbum /> },
        { path: "/search", element: <SearchResult /> },
        { path: "/playlists", element: <Playlists /> },
        { path: "/createplaylist", element: <CreatePlaylist /> },
        { path: "/admin", element: <Admin /> },
        { path: "/report", element: <Report /> },
        { path: "/dashboard", element: <Dashboard /> },
        { path: "/user-playlists/:id", element: <UserPlaylists /> },
        {
          path: "/me/:id",
          element: <ListenerMe />,
        },
        { path: "/user/:id", element: <ListenerPublic /> },
        {
          path: "/artist/:id",
          element: <ArtistProfileUser />,
        },
        { path: "/artist-events/:id", element: <ArtistEvents /> },
        { path: "/artist-albums/:id", element: <ArtistAlbum /> },
        { path: "/artists", element: <Artists /> },
        { path: "/settings", element: <Settings /> },
        { path: "/new", element: <NewReleases /> },
        { path: "/albums", element: <Albums /> },
        { path: "/album/:id", element: <Album /> },
        { path: "/playlist/:id", element: <PlaylistPage /> },
        { path: "/admin/generate-report", element: <GenerateReport /> },
        { path: "/admin/report-result", element: <ReportResult /> },
        { path: "/page-not-found", element: <NotFound /> },
        { path: "*", element: <NotFound /> },
        { path: "/history/:id", element: <History /> },
        { path: "/logout", element: <Logout /> },
        { path: "/follows/:id", element: <Follow /> },
        { path: "/artists", element: <Artists /> },
        { path: "recent-plays/:id", element: <RecentPlays /> },
      ],
    },
  ]);

  return (
    <ModalProvider>
      <PlaybarProvider>
        <ModalContent router={router} />
      </PlaybarProvider>
    </ModalProvider>
  );
}

// Separate component to use the modal context
const ModalContent = ({ router }) => {
  const { modalState, closeModal } = useModal();

  return (
    <>
      <RouterProvider router={router} />
      <Modal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        buttons={modalState.buttons}
        onClose={closeModal}
        closeOnOverlayClick={modalState.closeOnOverlayClick}
      />
    </>
  );
};

export default App;
export const appLogo = _appLogo;
