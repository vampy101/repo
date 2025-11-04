#include "SD_Card.h"
#include "Audio.h"
#include "ui.h"
#include "LVGL_Driver.h"
#include "BAT_Driver.h"
#include <ESP32Time.h>

ESP32Time rtc(0);

SemaphoreHandle_t audio_mutex; 

#define I2S_DOUT      47
#define I2S_BCLK      48  
#define I2S_LRC       38 

#define MAX_FILES 150
// Array to store file names
String audioFiles[MAX_FILES];
String audioFilesShort[MAX_FILES];

int fileCount = 0;
bool changeIsMade=0;
bool playPressed=0;
bool stopPressed=0;
bool nextPressed=0;
bool volumePressed=0;
bool isPlaying=1;

int rolerIndex=0;
int chosenFile=10;
String playingSong="";
Audio audio;
uint8_t Volume = 10;

unsigned long batTime=0;
int deb=0;

void resetClock()
{
   rtc.setTime(0, 0, 0, 17, 1, 2021);
}

void Play_Music_test() {
  if(chosenFile==0 || chosenFile==1)
  chosenFile=0;
  else
  chosenFile=chosenFile-2;

  bool ret = audio.connecttoFS(SD_MMC,audioFiles[chosenFile].c_str());
  playingSong=audioFiles[chosenFile].substring(1,audioFiles[chosenFile].length()-3).c_str();

 
   
  if(ret) 
    printf("Music Read OK\r\n");
  else
    printf("Music Read Failed\r\n");
}

void Play_Music_Random() {

   chosenFile=random(0, fileCount);
   if(chosenFile==0 || chosenFile==1)
  chosenFile=0;
  else
  chosenFile=chosenFile-2;

  bool ret = audio.connecttoFS(SD_MMC,audioFiles[chosenFile].c_str());



  playingSong=audioFiles[chosenFile].substring(1,audioFiles[chosenFile].length()-3).c_str();
  if(ret) 
    printf("Music Read OK\r\n");
  else
    printf("Music Read Failed\r\n");
}

void Audio_Init() {
  audio.setPinout(I2S_BCLK, I2S_LRC, I2S_DOUT);
  audio.setVolume(Volume); // 0...21    
}

void listFiles(fs::FS &fs, const char *dirname, uint8_t levels) {
  Serial.printf("Listing directory: %s\n", dirname);

  File root = fs.open(dirname);
  if (!root) {
    Serial.println("Failed to open directory");
    return;
  }
  if (!root.isDirectory()) {
    Serial.println("Not a directory");
    return;
  }

  File file = root.openNextFile();
  while (file && fileCount < MAX_FILES) {
    if (file.isDirectory()) {
      Serial.print("DIR : ");
      Serial.println(file.name());
      if (levels) {
        listFiles(fs, file.name(), levels - 1);
      }
    } else {
      Serial.print("FILE: ");
      Serial.print(file.name());
      audioFiles[fileCount] = "/"+String(file.name());
      fileCount++;
      
    }
    file = root.openNextFile();
  }
}

void clearItems(lv_obj_t *roller, const char *new_item) {
    const char *current_options = "";
    static char options_buffer[512];  // Make sure it's large enough
    snprintf(options_buffer, sizeof(options_buffer), "%s\n%s", current_options, new_item);
    lv_roller_set_options(roller, options_buffer, LV_ROLLER_MODE_NORMAL);
}

void add_item_to_roller(lv_obj_t *roller, const char *new_item) {
    // Get the internal label and extract current options
    const char *current_options = lv_label_get_text(lv_obj_get_child(roller, 0));
    
    // Allocate space for the new options string
    static char options_buffer[5120];  // Make sure it's large enough
    snprintf(options_buffer, sizeof(options_buffer), "%s\n%s", current_options, new_item);

    // Set the updated options back to the roller
    lv_roller_set_options(roller, options_buffer, LV_ROLLER_MODE_NORMAL);
}



void setup()
{
Serial.begin(115200);
audio_mutex = xSemaphoreCreateMutex(); 
pinMode(0,INPUT_PULLUP);
resetClock();

I2C_Init();
TCA9554PWR_Init(0x00); 
  SD_Init();
  listFiles(SD_MMC, "/", MAX_FILES);
  Audio_Init();
  Play_Music_test(); 


   xTaskCreatePinnedToCore(
    Driver_Loop,     
    "Other Driver task",   
    20480,                
    NULL,                 
    3,                    
    NULL,                
    0                    
  );
}

void changeSong(lv_event_t * e)
{
 if (xSemaphoreTake(audio_mutex, portMAX_DELAY)) { 
  chosenFile=lv_roller_get_selected(ui_Roller1); 
  xSemaphoreGive(audio_mutex); 
  }
}

void changeVolume(lv_event_t * e)
{
 if (xSemaphoreTake(audio_mutex, portMAX_DELAY)) { 
  changeIsMade=true;
  volumePressed=true;
  Volume=lv_slider_get_value(ui_Slider1);
  lv_label_set_text(ui_volumeLBL, String(Volume).c_str());
 xSemaphoreGive(audio_mutex); 
  }
}

void playSelected(lv_event_t * e)
{
 if (xSemaphoreTake(audio_mutex, portMAX_DELAY)) { 
 changeIsMade=true;
 
 playPressed=true;
 isPlaying=1;
 resetClock();
 xSemaphoreGive(audio_mutex); 
  }
}

void nextSelected(lv_event_t * e)
{
 if (xSemaphoreTake(audio_mutex, portMAX_DELAY)) { 
 changeIsMade=true;
 nextPressed=true;
 isPlaying=1;
 resetClock();
 xSemaphoreGive(audio_mutex); 
  }
}



void stopSelected(lv_event_t * e)
{
 if (xSemaphoreTake(audio_mutex, portMAX_DELAY)) { 
 changeIsMade=true;
 stopPressed=true;
 isPlaying=0;
 xSemaphoreGive(audio_mutex); 
  }
}

void Driver_Loop(void *parameter)
{
  LCD_Init();
  Backlight_Init();
  Set_Backlight(30);
  BAT_Init();
  Lvgl_Init();
  ui_init();
  delay(1000);
  clearItems(ui_Roller1, "");
  for(int i=0;i<fileCount;i++)
  add_item_to_roller(ui_Roller1,audioFiles[i].substring(1,audioFiles[i].length()-3).c_str());
  while(1)
  {
    Lvgl_Loop();

     if(millis()>batTime+1000)
     {
      batTime=millis();
      float voltage=BAT_Get_Volts();
      lv_label_set_text(ui_Label1,String(voltage).c_str());
      if(isPlaying)
      lv_label_set_text(ui_timeLBL,rtc.getTime().substring(3,8).c_str());
      else
      lv_label_set_text(ui_timeLBL,"00:00");
     }

    //lv_roller_set_selected(ui_Roller1, rolerIndex, LV_ANIM_ON);
    lv_label_set_text(ui_songName,playingSong.c_str());
    vTaskDelay(pdMS_TO_TICKS(5));

    

  }
}

void loop()
{
 if (xSemaphoreTake(audio_mutex, portMAX_DELAY)) {  
 if(changeIsMade==true)
 {
    if(playPressed==1)
    {Play_Music_test();
    playPressed=0;}
    
    if(stopPressed==true){
    audio.stopSong(); 
    stopPressed=0;}

    if(nextPressed==true){
    Play_Music_Random();
    nextPressed=0;}

    if(volumePressed==true){
    audio.setVolume(Volume);
    volumePressed=0;}
   
 changeIsMade=false;
 }

 xSemaphoreGive(audio_mutex); 
}

if(digitalRead(0)==0)
{
  if(deb==0)
  {deb=1;
  chosenFile++;
  if(chosenFile>=fileCount)
  chosenFile=0;
  Play_Music_test();}
}else deb=0;

audio.loop();
}

void audio_eof_mp3(const char *info) {
   if (xSemaphoreTake(audio_mutex, portMAX_DELAY)) {  
    resetClock();
     xSemaphoreGive(audio_mutex); 
}
   
 Play_Music_Random(); 
}