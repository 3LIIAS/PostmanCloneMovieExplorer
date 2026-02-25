package com.daw.PostmanClone.controller;

import org.springframework.beans.factory.annotation.Value; // NUEVO: Importación necesaria
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import java.util.ArrayList;
import java.util.List;

@Controller
public class Enlace {


    @Value("${tmdb.api.key}")
    private String miApiKey;

    private static List<String> historial = new ArrayList<>();

    @GetMapping("/")
    public String inicio() {
        return "index";
    }

    // NUEVO: Este método permite que script.js obtenga la clave
    @GetMapping("/obtener-clave")
    @ResponseBody
    public String enviarClave() {
        return miApiKey;
    }

    @PostMapping("/guardar-historial")
    @ResponseBody
    public String guardar(@RequestParam String url) {
        if (url != null && !url.isEmpty()) {
            historial.add(0, url);
            if (historial.size() > 5) historial.remove(5);
        }
        return "OK";
    }

    @GetMapping("/ver-historial")
    @ResponseBody
    public List<String> verHistorial() {
        return historial;
    }
}