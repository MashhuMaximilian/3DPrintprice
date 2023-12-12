<template>
  <div class="file-upload-container">
    <!-- Display before the file is uploaded -->
    <div v-if="!isFileUploaded.value">
      <div 
        class="dropzone" 
        @dragover.prevent="dragOver" 
        @dragleave.prevent="dragLeave" 
        @drop.prevent="handleDrop"
      >
        <div class="file-upload-message">
          Drop your files here or <span @click="triggerFileInput" class="browse">browse</span>
          <div class="max-size">Maximum size: 150MB</div>
        </div>
        <input 
          type="file" 
          ref="fileInput" 
          @change="onFileChange" 
          accept=".stl" 
          hidden
        />
      </div>
    </div>

    <!-- Display after the file is uploaded -->
    <div v-else>
      <div class="uploaded-file-view">
        <span class="uploaded">File uploaded:</span>
        <div class="uploaded-file-name">{{ uploadedFileName.value }}</div>
        <v-btn variant="plain" @click="resetUpload">Upload another file</v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: 'FileUpload',
  props: {
    viewer: {
      type: Object,
      default: () => {}
    }
  },

  setup(props, { emit }) {
    // Reactive state
    const uploadedFileName = ref(null);
    const isFileUploaded = ref(false);
    const fileInput = ref(null);

    // Methods
    const triggerFileInput = () => {
      fileInput.value.click();
    };

    const onFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        isFileUploaded.value = true;
        uploadedFileName.value = file.name;
        emit('file-uploaded', file);
      }
    };

    const dragOver = () => {
      fileInput.value.querySelector('.dropzone').classList.add('active');
    };

    const dragLeave = () => {
      fileInput.value.querySelector('.dropzone').classList.remove('active');
    };

    const handleDrop = (event) => {
      const file = event.dataTransfer.files[0];
      if (file && file.size <= 150 * 1024 * 1024) {
        uploadedFileName.value = file.name;
        isFileUploaded.value = true;
        if (props.viewer && props.viewer.loadSTLModel) {
          emit('file-uploaded', file);
        } else {
          console.error("Viewer is not ready or loadSTLModel is not a function");
        }
      }
    };

    const resetUpload = () => {
      isFileUploaded.value = false;
      uploadedFileName.value = null;
    };

    // Watchers
    watch(() => props.viewer, (newVal) => {
      console.log("Viewer prop changed:", newVal);
    });

    // Return reactive state and methods
    return {
      uploadedFileName,
      isFileUploaded,
      fileInput,
      triggerFileInput,
      onFileChange,
      dragOver,
      dragLeave,
      handleDrop,
      resetUpload
    };
  }
};
</script>


<style scoped>
.file-upload-container {
  border: 2px dashed #fff;
  padding: 20px;
  position: relative;
}

.dropzone {
  text-align: center;
  height:300px;
  border-radius: 12px;
  vertical-align: middle;
}

.file-upload-message {
  font-size: 18px;
  padding: 20px;
  color: #1F2937;
}

.browse {
  color: #3B82F6;
  text-decoration: underline;
  cursor: pointer;
}

.dropzone.active {
  background-color: #E3F2FD; /* Light blue background when dragging over */
}

.max-size {
  font-size: 14px;
  color: #9CA3AF;
}

/* Style for the uploaded file name */
.uploaded-file-name {
  margin-top: 10px;
  font-weight: 600;
  font-size: 18px;
}

.uploaded-file-view {
  display: flex;
padding: 25px;
flex-direction: column;
justify-content: center;
align-items: center;
gap: 15px;
align-self: stretch;
  background-color: #E3F2FD;
  color:#1976D2;
  border-radius: 12px;
}

.v-btn {
  font-size: 11px;
}
.uploaded {
  color: #5CBBF6;
  font-size: 13px;
  font-weight: 400;
  margin-bottom: -15px;
}
</style>
