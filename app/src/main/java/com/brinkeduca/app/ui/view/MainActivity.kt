package com.brinkeduca.app.ui.view

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.brinkeduca.app.R
import com.brinkeduca.app.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Usando ViewBinding para acessar os componentes do XML
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnOption1.setOnClickListener { checkAnswer(false) }
        binding.btnOption2.setOnClickListener { checkAnswer(true) }
        binding.btnOption3.setOnClickListener { checkAnswer(false) }

        binding.btnTest.setOnClickListener {
            Toast.makeText(this, "Buscando próxima questão no banco...", Toast.LENGTH_SHORT).show()
        }
    }

    private fun checkAnswer(isCorrect: Boolean) {
        val message = if (isCorrect) "Correto! 🎉" else "Errado, tente novamente! ❌"
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }
}
