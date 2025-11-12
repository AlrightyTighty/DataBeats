import { useEffect, useRef, useState } from "react";
import Topnav from "../Components/Topnav";
import { useNavigate, useParams } from "react-router";
import styles from "./Stream.module.css";
import API from "../lib/api";

import albumart_test from "../assets/albumart.png";

import filledStar from "../assets/graphics/filled_star.png";
import unfilledStar from "../assets/graphics/unfilled_star.png";

import playButton from "../assets/graphics/play button.png";
import pauseButton from "../assets/graphics/pause button.png";
import useAuthentication from "../hooks/useAuthentication";
import ContextMenu from "../Components/ContextMenu";
import useContextMenu from "../hooks/useContextMenu";
import ContextMenuButton from "../Components/ContextMenuButton";

const Stream = () => {
  const [songInfo, setSongInfo] = useState(null);
  const [songData, setSongData] = useState(null);
  const [albumCover, setAlbumCover] = useState(null);

  const [paused, setPaused] = useState(true);

  const audioRef = useRef(null);

  const { id } = useParams();

  const [progressPercent, setProgressPercent] = useState(0);

  const ranRef = useRef(false);

  const [reviews, setReviews] = useState([
    {
      user_id: 7,
      user_name: "alrightytighty",
      starCount: 5,
      comment:
        "Fire ass album!!! Great stuff, lvl0p. \n test \n test \n test \n test",
      reviewId: 1,
    },
  ]);

  const [reviewPage, setReviewPage] = useState(1);

  const [creatingReview, setCreatingReview] = useState(false);

  const [createReviewStars, setCreateReviewStars] = useState(0);
  const [createReviewTempStars, setCreateReviewTempStars] = useState(null);

  const createReviewCommentRef = useRef(null);

  const userInfo = useAuthentication();

  const navigate = useNavigate();

  useEffect(() => {
    if (ranRef.current) return;

    ranRef.current = true;
    console.log("erm...");
    const controller = new AbortController();
    (async () => {
      const songDataResponse = await fetch(`${API}/api/stream/${id}`, {
        method: "PATCH",
        credentials: "include",
        signal: controller.signal,
      });

      const songInfoResponse = await fetch(`${API}/api/song/${id}`, {
        method: "GET",
        signal: controller.signal,
      });

      console.log("made it through both requests");

      if (!songInfoResponse.ok || !songDataResponse.ok) return;

      const songInfo = await songInfoResponse.json();
      const songData = await songDataResponse.json();

      setSongInfo(songInfo);
      setSongData(songData);

      console.log(songInfo);

      const albumArtResponse = await fetch(
        `${API}/api/art/${songInfo.albumArtId}`
      );

      setAlbumCover((await albumArtResponse.json()).fileData);

      const reviews = await (
        await fetch(`${API}/api/rating/song/${id}?page=${reviewPage}&count=50`)
      ).json();
      console.log(reviews);

      setReviews(reviews);
    })();
  }, []);

  const onPlayButtonPressed = async () => {
    const audioElement = audioRef.current;
    if (!audioRef) return;
    console.log("clicked and has audio");

    if (paused) await audioElement.play();
    else await audioElement.pause();
    setPaused(!paused);
  };

  const updateProgress = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const percent = (audio.currentTime / audio.duration) * 100;
    setProgressPercent(isNaN(percent) ? 0 : percent);
  };

  const starHover = (index) => {
    setCreateReviewTempStars(index + 1);
  };

  const starUnhover = (index) => {
    if (createReviewTempStars == index + 1) {
      setCreateReviewTempStars(null);
    }
  };

  const starSelect = (index) => {
    setCreateReviewStars(index + 1);
  };

  const publishReview = async () => {
    if (createReviewStars == 0) return;
    const comment = createReviewCommentRef.current.value;
    const response = await fetch(`${API}/api/rating`, {
      method: "POST",
      body: JSON.stringify({
        songId: id,
        starCount: createReviewStars,
        comment: comment,
      }),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) setCreatingReview(false);
    else return;

    reviews.push(await response.json());

    setReviews(reviews.slice());
  };

  const createStarCount = createReviewTempStars ?? createReviewStars ?? 0;

  const songContextItems = [];
  const songContextFunctions = [];

  if (userInfo && songInfo && userInfo.musicianId == songInfo.creatorId) {
    songContextItems.push("Delete Song");
    songContextFunctions.push(async () => {
      await fetch(`${API}/api/song/${songInfo.songId}`, {
        method: "delete",
        credentials: "include",
      });

      alert("The song has been deleted.");

      navigate(`/album/${songInfo.albumId}`);
    });
  }

  if (userInfo && songInfo && userInfo.musicianId != songInfo.creatorId) {
    songContextItems.push("Report Song");
    songContextFunctions.push(() => {
      navigate(`/report?id=${id}&type=SONG`);
    });
  }

  if (userInfo && songInfo && userInfo.adminId != null) {
    songContextItems.push("Delete (as admin)");
    songContextFunctions.push(() => {
      console.log("admin deleting isn't implemented ermmm");
    });
  }

  const [contextMenuRef, contextMenu, setContextMenu] = useContextMenu();

  return (
    <>
      <ContextMenu
        ref={contextMenuRef}
        items={contextMenu.items}
        functions={contextMenu.functions}
        x={contextMenu.x}
        y={contextMenu.y}
        visible={contextMenu.visible}
      />
      <Topnav />
      <main id={styles["main"]}>
        <div id={styles["left-half"]}>
          {(songData && (
            <>
              <div id={styles["song-info"]}>
                <ContextMenuButton
                  right="30px"
                  top="30px"
                  functions={songContextFunctions}
                  items={songContextItems}
                  setContextMenu={setContextMenu}
                />
                <img
                  id={styles["album-art"]}
                  src={`data:image/png;base64,${albumCover}`}
                />
                <div id={styles["song-right"]}>
                  <div id={styles["song-right-text"]}>
                    <h1 id={styles["song-title"]}>{songInfo.songName}</h1>
                    <p className={styles["song-text-info-item"]}>
                      From the album: {songInfo.albumName}
                    </p>
                    <p className={styles["song-text-info-item"]}>
                      Artists: {songInfo.artistNames.join(", ")}
                    </p>
                    <p className={styles["song-text-info-item"]}>
                      Duration: {songInfo.duration}
                    </p>
                  </div>
                  <div id={styles["player-controls"]}>
                    <button
                      onClick={onPlayButtonPressed}
                      id={styles["play-button"]}
                    >
                      <img
                        style={{ display: paused ? "block" : "none" }}
                        src={playButton}
                      />
                      <img
                        style={{ display: !paused ? "block" : "none" }}
                        src={pauseButton}
                      />
                    </button>
                    <div id={styles["play-bar"]}>
                      <div
                        style={{ height: "100%", width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
                <audio
                  autoPlay
                  onTimeUpdate={updateProgress}
                  onPause={() => setPaused(true)}
                  onPlay={() => setPaused(false)}
                  ref={audioRef}
                  src={`data:audio/mpeg;base64,${songData.fileData}`}
                ></audio>
              </div>
              <div id={styles["review-section"]}>
                <button
                  onClick={() => {
                    setCreatingReview(!creatingReview);
                  }}
                  className={styles["review-button"]}
                  id={styles["create-review-button"]}
                >
                  {creatingReview ? "- Cancel" : "+ Add Review"}
                </button>
                <h1>Reviews</h1>
                {(creatingReview && (
                  <div id={styles["create-review"]}>
                    <div className={styles["review-header"]}>
                      <h2>Create Review</h2>
                      <div className={styles["review-stars"]}>
                        {Array.from({ length: createStarCount }).map(
                          (_, index) => {
                            return (
                              <img
                                onClick={() => starSelect(index)}
                                onMouseLeave={() => starUnhover(index)}
                                onMouseEnter={() => starHover(index)}
                                key={index}
                                className={styles["review-star"]}
                                src={filledStar}
                              />
                            );
                          }
                        )}
                        {Array.from({ length: 5 - createStarCount }).map(
                          (_, index) => {
                            return (
                              <img
                                onClick={() =>
                                  starSelect(index + createStarCount)
                                }
                                onMouseLeave={() =>
                                  starUnhover(index + createStarCount)
                                }
                                onMouseEnter={() =>
                                  starHover(index + createStarCount)
                                }
                                key={index + createStarCount}
                                className={styles["review-star"]}
                                src={unfilledStar}
                              />
                            );
                          }
                        )}
                      </div>
                    </div>
                    <textarea
                      maxLength={100}
                      ref={createReviewCommentRef}
                      id={styles["create-review-comment"]}
                      placeholder="Enter Review Text"
                    />
                    <button
                      onClick={publishReview}
                      className={styles["review-button"]}
                    >
                      Publish
                    </button>
                  </div>
                )) || (
                  <div id={styles["reviews"]}>
                    {reviews.map((review, index) => {
                      const reviewFunctions = [];
                      const reviewItems = [];

                      if (userInfo.userId == review.userId) {
                        reviewFunctions.push(async () => {
                          await fetch(`${API}/api/rating/${review.userRatesSongId}`, {
                            method: "delete",
                            credentials: "include",
                          });

                          reviews.splice(index, 1);
                          setReviews(reviews.slice());
                          setContextMenu({visible: false});
                        });

                        reviewItems.push("Delete");
                      }

                      return (
                        <div className={styles["review"]}>
                          <ContextMenuButton
                            right="30px"
                            top="30px"
                            setContextMenu={setContextMenu}
                            functions={reviewFunctions}
                            items={reviewItems}
                          />
                          <div className={styles["review-header"]}>
                            <h2>{review.username}</h2>
                            <div className={styles["review-stars"]}>
                              {Array.from({ length: review.starCount }).map(
                                (_, index) => {
                                  return (
                                    <img
                                      key={index}
                                      className={styles["review-star"]}
                                      src={filledStar}
                                    />
                                  );
                                }
                              )}
                              {Array.from({ length: 5 - review.starCount }).map(
                                (_, index) => {
                                  return (
                                    <img
                                      key={index + review.starCount}
                                      className={styles["review-star"]}
                                      src={unfilledStar}
                                    />
                                  );
                                }
                              )}
                            </div>
                          </div>
                          <div className={styles["review-content"]}>
                            {review.comment}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )) || (
            <div id={styles["song-info"]}>
              <h1
                style={{
                  margin: "auto",
                  fontSize: "32pt",
                  textAlign: "center",
                }}
              >
                Loading song info
              </h1>
              <div className="loader"></div>
            </div>
          )}
        </div>
        {songInfo && (
          <div id={styles["lyrics-section"]}>
            <h1>Lyrics</h1>
            <div id={styles["lyrics"]}>{songInfo.lyrics}</div>
          </div>
        )}
      </main>
    </>
  );
};

export default Stream;
