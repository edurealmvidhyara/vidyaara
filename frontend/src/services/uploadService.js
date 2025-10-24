// Upload service for handling file uploads through backend APIs
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
import axios from "axios";
class UploadService {
  // Upload course thumbnail
  async uploadCourseThumbnail(courseId, file) {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `${API_BASE_URL}/courses/${courseId}/thumbnail`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload thumbnail");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Upload thumbnail error:", error);
      throw error;
    }
  }

  // Upload carousel image
  async uploadCarouselImage(file) {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${API_BASE_URL}/courses/carousel/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload carousel image");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Upload carousel image error:", error);
      throw error;
    }
  }

  // Delete carousel image
  async deleteCarouselImage(publicId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/courses/carousel/${publicId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete carousel image");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Delete carousel image error:", error);
      throw error;
    }
  }

  // Upload course note
  async uploadCourseNote(courseId, noteData) {
    try {
      const formData = new FormData();
      formData.append("title", noteData.title);
      formData.append("topic", noteData.topic);
      formData.append("description", noteData.description || "");

      if (noteData.sectionIndex !== undefined) {
        formData.append("sectionIndex", noteData.sectionIndex);
      }
      if (noteData.contentIndex !== undefined) {
        formData.append("contentIndex", noteData.contentIndex);
      }

      if (noteData.file) {
        formData.append("file", noteData.file);
      }

      const response = await axios.post(
        `${API_BASE_URL}/courses/${courseId}/notes`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Upload note error:", error);
      throw error;
    }
  }

  // Delete course note
  async deleteCourseNote(courseId, noteId, sectionIndex, contentIndex) {
    try {
      let url = `${API_BASE_URL}/courses/${courseId}/notes/${noteId}`;
      const params = new URLSearchParams();

      if (sectionIndex !== undefined) {
        params.append("sectionIndex", sectionIndex);
      }
      if (contentIndex !== undefined) {
        params.append("contentIndex", contentIndex);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete note");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Delete note error:", error);
      throw error;
    }
  }

  // Get course notes
  async getCourseNotes(courseId, sectionIndex, contentIndex) {
    try {
      let url = `${API_BASE_URL}/courses/${courseId}/notes`;
      const params = new URLSearchParams();

      if (sectionIndex !== undefined) {
        params.append("sectionIndex", sectionIndex);
      }
      if (contentIndex !== undefined) {
        params.append("contentIndex", contentIndex);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get notes");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Get notes error:", error);
      throw error;
    }
  }
}

export const uploadService = new UploadService();
