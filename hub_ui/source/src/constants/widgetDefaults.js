export const packages = {
  volt: "python-3.7 volt_shell-0.2 cue_houdini_submit-0.2 volt_server_production-0.1 studio_tools-1.0 studio_resources-0.1 asset_library-0.1",
  voltHoudini: "volt_houdini_session_tvc-0.2 volt_houdini_app_session_tvc-0.1 volt_houdini_asset_session_tvc-1.1 et_houdini-0.1 et_houdini_filepath_editor-0.1 et_houdini_flipit-2.5.4",
  voltMaya: "volt_maya_session_tvc-0.2 volt_maya_app_session_tvc-0.1 volt_maya_asset_session_tvc-0.2",
  voltNuke: "volt_nuke_session_tvc-0.2 volt_nuke_app_session_tvc-0.1 volt_nuke_asset_session_tvc-1.2 cue_nuke_submit-0.1"
};

export const widgetDefaults = {
  apps: {
    apps: [
      {
        name: "Konsole",
        cmd: "konsole"
      },
      {
        name: "File Manager",
        cmd: "dolphin"
      },
      {
        name: "Volt",
        cmd: "volt_ui",
        shell: true
      },
      {
        name: "Cue",
        cmd: "cuegui"
      },
      {
        name: "System Monitor",
        cmd: "ksysguard"
      },
      {
        name: "Chrome",
        cmd: "google-chrome"
      },
      {
        name: "Asset Library",
        cmd: "asset_library"
      },
      {
        name: "Houdini",
        cmd: "rez env --nl {volt} {voltHoudini} houdini htoa sidefx_labs houdini_qlib -- houdinifx -n -foreground -force-fx-license",
        shell: true
      },
      {
        name: "Maya",
        cmd: "rez env --nl {volt} {voltMaya} maya-2022 mtoa-5.1.3.1 maya_studiolibrary-2.9.6 maya_animbot-2.1.7 maya_ragdoll-2022.03 -- TEMPDIR=$CACHE/maya maya",
        shell: true
      },
      {
        name: "Mari",
        cmd: "mari",
        shell: true
      },
      {
        name: "Designer",
        cmd: "designer",
        shell: true
      },
      {
        name: "Nuke",
        cmd: "rez env --nl {volt} {voltNuke} nuke-13.2 nuke_mmcolortarget-3.1 sfnuketools-1.1 nuke_ldpk-2.7 numpy-1.21.0 baselight_nuke-5.3.14806 et_nuke_toolsetmanager-0.1 et_nuke_gizmomanager-0.1 nuke_card_to_track-7.5 et_nuke_copy_paste-0.1 nuke_geotracker-2022.1 nuke_animationmaker-1.4 nuke_animatedSnap3D-1.1.0 nuke_vector_matrix-1.0.0 neatvideo_ofx-4.0.0 sapphireOFX-8.15 realsmartmotionblur-4.0 bokeh-1.4.8 nuke_survival_toolkit-2.1 nuke_gradienteditor-1.1 -- nuke",
        shell: true
      },
      {
        name: "After Effects",
        cmd: "aftereffects",
        shell: true
      },
      {
        name: "Blender",
        cmd: "blender",
        shell: true
      },
      {
        name: "DJV",
        cmd: "rez env --nl djv -- djv"
      },
      {
        name: "Illustrator",
        cmd: "illustrator",
        shell: true
      },
      {
        name: "Natron",
        cmd: "natron",
        shell: true
      },
      {
        name: "Painter",
        cmd: "painter",
        shell: true
      },
      {
        name: "Unreal Engine",
        cmd: "unreal",
        shell: true
      },
      {
        name: "VSCode",
        cmd: "code"
      }
    ]
  }
};
