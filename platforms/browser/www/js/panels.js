/**
 * Created by irudym on 25-Oct-16.
 *
 * Multipanel application library
 */


function Panel(panel_name, panel_width, html_object) {

  this.initialize = function(panel_name, panel_width, html_object) {
      this.name = panel_name;
      this.width = panel_width;
      this.object = html_object;
  };

  this.set_width = function(width) {
      this.object.width(width);
  };

  this.get_width = function() {
      return this.object.width();
  };

  this.get_panel_width = function() {
        return this.width;
  };

  this.set_left_margin = function(margin) {
      this.object.css("margin-left", margin + "px");
  };

  this.set_transition = function(trans) {
      this.object.css("transition", trans + "s");
  };

  this.show = function() {
      this.object.css( "display", "block" );
      this.set_transition(0.5);
      this.set_left_margin(0);
  };

  this.hide = function() {
      if(this.name!="menu") {
          this.set_left_margin($(window).width());
          this.object.css( "display", "none" );
      }
  };


  this.initialize(panel_name, panel_width, html_object);
}


function PanelsManager() {
    this.panels = [];
    this.current_panel = null;
    this.menu_panel = null;

    /*
        panel_params = {panel: "panel class", slide: "left|right|none"}
     */
    this.add_panel = function(panel_params) {
        this.panels.push(panel_params);
        if(panel_params.panel.name == "menu") this.menu_panel = panel_params.panel;
        //panel.hide();
    };

    this.set_current = function(name) {
        for(var i in this.panels) {
            this.panels[i]['panel'].hide();
            if(this.panels[i]['panel'].name == name) {
                this.current_panel = this.panels[i]['panel'];
                this.current_panel.show();
            }
        }
    };

    this.get_panel = function(name) {
        for(var i in this.panels) {
            if(this.panels[i]['panel'].name == name) {
                return this.panels[i]['panel'];
            }
        }
        log("ERROR: here is no panel with name: " + name);
        return null;
    };

    this.is_menu_open = function() {
        if(this.menu_panel!=null)
            if(this.menu_panel.get_width()>0) return true;
        return false;
    }

    this.call_menu = function() {
        if(this.menu_panel == null) return;
        var size = this.menu_panel.get_panel_width();
        if(this.menu_panel.get_width()>0) size = 0;
        this.menu_panel.set_width(size);
        this.current_panel.set_left_margin(size);
    };

    this.close_menu = function() {
        this.menu_panel.set_width(0);
        this.current_panel.set_left_margin(0);
    };

    this.back_to = function(name) {
        var new_panel = this.get_panel(name);
        if(new_panel == null) {
            log("ERROR: here is no panel named: " + name);
            return;
        }
        new_panel.show();
        this.current_panel.set_left_margin($(window).width());
        this.current_panel = new_panel;
    }

}